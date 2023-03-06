import React, { useState } from 'react';
import AuthService from '../AuthService';
import '../auth.css';
import {useNavigate} from "react-router-dom";

function SignUpForm () {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formErrors, setFormErrors] = useState({login: '', password: ''});
    const [loginValid, setLoginValid] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);
    const [confirmPasswordValid, setConfirmPasswordValid] = useState(true);
    const [response, setResponse] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordValid(false);
            setConfirmPasswordValid(false);
            formErrors.password = 'password should match';
        } else {
            AuthService.signUp(login, password).then(response => {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('accessToken', response.data['accessToken']);
                localStorage.setItem('refreshToken', response.data['refreshToken']);
                navigate('/chat');
            }).catch(error => {
                setResponse(error['response']['data']['message']);
            });
        }
    }

    const handleClick = (path) => {
        // переход на другую страницу
        navigate(path);
    };

    const handleUserInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setResponse('');
        validateField(name, value);
    }

    const validateField = (fieldName, value) => {
        let flag;
        switch(fieldName) {
            case 'login':
                setLogin(value);
                flag = value.match(/^[a-z0-9-]{4,}$/i) || value === '';
                setLoginValid(flag);
                formErrors.login = flag ? '' : 'Login is invalid';
                break;
            case 'password':
                setPassword(value);
                flag = value.length >= 6 || value.length === 0;
                setPasswordValid(flag);
                formErrors.password = flag ? '': 'Password is too short';
                break;
            case 'password2':
                setConfirmPassword(value);
                setConfirmPasswordValid(password === value);
                break;
            default:
                break;
        }
    }

    const errorClass = (fieldValid) => {
        return fieldValid ? '' :  'error';
    }

    return (<form className="main" onSubmit={handleSubmit}>
        <div className="content">
            <div className="label">Sign up</div>
            <div className="dscError" >{formErrors['login']}</div>
            <input type="text"
                   required
                   name="login"
                   value={login}
                   className={errorClass(loginValid)}
                   onChange={(e) => {handleUserInput(e)}}/>
            <div className="label">Password</div>
            <div className="dscError" >{formErrors['password']}</div>
            <input type="password"
                   required
                   name="password"
                   value={password}
                   className={errorClass(passwordValid)}
                   onChange={(e) => {handleUserInput(e)}}/>
            <div className="label">Confirm password</div>
            <input type="password"
                   required
                   name="password2"
                   value={confirmPassword}
                   className={errorClass(confirmPasswordValid)}
                   onChange={(e) => {handleUserInput(e)}}/>
            <div className="dscError" >{response}</div>
            <input type="submit" value="Sign up" id="button"></input>
            <div className="label"><span onClick={() => handleClick('/login')}>login</span></div>

        </div>
    </form>);
};

export default SignUpForm;
import React, {useState} from 'react';
import AuthService from '../AuthService';
import '../auth.css';
import {useNavigate} from "react-router-dom";

function LoginForm () {

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [formErrors, setFormErrors] = useState({login: '', password: ''});
    const [loginValid, setLoginValid] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);
    const [response, setResponse] = useState('');

    const navigation = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // AuthService.login(login, password).then(response => {
        //     localStorage.setItem('isAuthenticated', 'true');
        //     localStorage.setItem('accessToken', response.data['accessToken']);
        //     localStorage.setItem('refreshToken', response.data['refreshToken']);
            navigation('/chat');
        // }).catch(error => {
        //     setResponse(error['response']['data']['message']);
        // });
    }

    const handleClick = (path) => {
        // переход на другую страницу
        navigation(path);
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
            default:
                break;
        }
    }

    const errorClass = (fieldValid) => {
        return fieldValid ? '' :  'error';
    }

    return <form className="main" onSubmit={(e) => handleSubmit(e)}>
            <div className="content">
                <div className="label">Login</div>
                <div className="dscError" >{formErrors['login']}</div>
                <input type="text"
                       name="login"
                       required
                       value={login}
                       className={errorClass(loginValid)}
                       onChange={(e) => {handleUserInput(e)}}/>
                <div className="label">Password</div>
                <div className="dscError" >{formErrors['password']}</div>
                <input type="password"
                       name="password"
                       required
                       value={password}
                       className={errorClass(passwordValid)}
                       onChange={(e) => {handleUserInput(e)}}/>
                <div className="dscError" >{response}</div>
                <input type="submit" value="Login" id="button"></input>
                <div className="label">
                    <span onClick={() => handleClick('/registration')}>sign up</span>
                </div>
            </div>
        </form>;

}

export default LoginForm;
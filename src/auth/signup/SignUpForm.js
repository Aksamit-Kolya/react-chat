import React, { useState } from 'react';
import AuthService from '../AuthService';
import '../auth.css';
import {useNavigate} from "react-router-dom";

function SignUpForm () {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        AuthService.signUp(login, password).then(response => {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('accessToken', response.data['accessToken']);
            localStorage.setItem('refreshToken', response.data['refreshToken']);
            navigate('/chat');
        });
    }


    const handleClick = (path) => {
        // переход на другую страницу
        navigate(path);
    };

    return (<form className="main" onSubmit={handleSubmit}>
        <div className="content">
            <div className="label">Sign up</div>
            <input type="text"
                   name="login"
                   value={login}
                   onChange={(e) => setLogin(e.target.value)}/>
            <div className="label">Password</div>
            <input type="password"
                   name="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}/>
            <div className="label">Confirm password</div>
            <input type="password"
                   name="password2"
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}/>
            <input type="submit" value="Sign up" id="button"></input>
            <div className="label"><span onClick={() => handleClick('/login')}>login</span></div>

        </div>
    </form>);
};

export default SignUpForm;
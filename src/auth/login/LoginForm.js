import React, { useState } from 'react';
import AuthService from '../AuthService';
import {useNavigate } from 'react-router-dom';
import '../auth.css';

function LoginForm () {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        AuthService.login(login, password).then(response => {
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
            <div className="label">Login</div>
            <input type="text"
                   name="login"
                   value={login}
                   onChange={(e) => setLogin(e.target.value)}/>
            <div className="label">Password</div>
            <input type="password"
                   name="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}/>
            <input type="submit" value="Login" id="button"></input>
            <div className="label" ><span onClick={() => handleClick('/registration')}>sign up</span></div>

        </div>
    </form>);
};

export default LoginForm;
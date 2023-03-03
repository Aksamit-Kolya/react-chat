import React from "react";
import ChatPage from "./pages/ChatPage";
import {Route, Routes} from 'react-router-dom';
import LoginForm from "./auth/login/LoginForm";
import SignUpForm from "./auth/signup/SignUpForm";

const App = () => {
  return (
    <Routes>
        <Route path="/" element={<LoginForm/>}/>
        <Route path="/login" element={<LoginForm/>}/>
        <Route path="/registration" element={<SignUpForm/>}/>
        <Route path="/chat" element={<ChatPage/>}/>
    </Routes>
  );
}

export default App;

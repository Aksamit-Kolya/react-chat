import React from "react"; 
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import { Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Routes>
        <Route path="/" element={<ChatPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
    </Routes>
  );
}

export default App;

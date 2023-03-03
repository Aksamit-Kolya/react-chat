import React from 'react';
import {Route, Routes, Navigate} from "react-router-dom";
import ChatPage from "./pages/ChatPage";

const AppRouter = () => {
    <Routes>
        <Route path="/" element={<ChatPage/>}/>
    </Routes>
    // const user = true;
    // return user ?
    // (
    //     <Routes>
    //         {privateRoutes.map(({path, Component}) => 
    //             <Route path={path} component={Component} exact={true}/>
    //         )}
    //         <Navigate to={CHAT_ROUTE}/>
    //     </Routes>
    // )
    // :
    // (
    //     <Routes>
    //         {publicRoutes.map(({path, Component}) => 
    //             <Route path={path} component={Component} exact={true}/>
    //         )}
    //         <Navigate to={LOGIN_ROUTE}/>
    //     </Routes>
    // )
}


export default AppRouter;
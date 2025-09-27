import React from "react";
// import { Route, Routes } from "react-router-dom";
//import SignIn from "./screens/SignUp.jsx";
 import SignUp from "./screens/SignUp.jsx";
// import { signUp } from "../../be/controllers/auth.controllers";
// import ForgotPassword from "./pages/ForgotPassword.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
export const serverURL = "http://localhost:8000";

function App() {
  return (
    <BrowserRouter>
    <Routes>
      
      {/* <Route path="/login" element={<Login />} /> */} 
      <Route path="/login" element={<SignUp />} />
      {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
    </Routes>
    </BrowserRouter>
  );
}

export default App;
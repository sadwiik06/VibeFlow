import React from 'react';
import {BrowserRouter, Routes,Route} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App(){
  return (
    <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route
        path="/"
        element={
          <PrivateRoute>
            <HomePage/>
          </PrivateRoute>
        }/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>
       </Routes>
    </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
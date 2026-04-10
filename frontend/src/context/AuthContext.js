import React, {createContext, useState, useEffect, useContext}
from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children})=>{
    const [user,setUser]= useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
        const token = localStorage.getItem('token');
        if(token){
            axios. get('http://localhost:5000/api/auth/me',{
                headers: {Authorization : `Bearer ${token}`},

            }).then((res)=>{
                setUser(res.data);
            }) .catch(()=>{
                localStorage.removeItem('token');
            }) .finally(()=>setLoading(false));
        }else{
            setLoading(false);
        }
    },[]);

    const register = async(userData) =>{
        const res = await axios.post('http://localhost:5000/api/auth/register',userData);
        localStorage.setItem('token',res.data.token);
        setUser(res.data);
        return res.data;
    };
    const login = async(email,password)=>{
        const res = await axios.post('http://localhost:5000/api/auth/login',{email,password});
            localStorage.setItem('token',res.data.token);
            setUser(res.data);
            return res.data;
    }
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };
    
    return (
        <AuthContext.Provider value={{ user, setUser, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

import React, {createContext, useContext,useEffect,useState} from 'react';

import io from 'socket.io-client';
import {useAuth} from './AuthContext';

const ChatContext = createContext();
export const useChat = ()=>useContext(ChatContext);
export const ChatProvider = ({children})=>{
    const {user}=useAuth();
    const [socket,setSocket]=useState([]);
    const [onlinrUsers,setOnlineUsers]=useState([]);
    useEffect(()=>{
        if(user){
            const token = localStorage.getItem('token');
            const newSocket = io('http://localhost:5000',{
                auth:{token},
            });
            setSocket(newSocket);
            return ()=> newSocket.close();
        }
    },[user]);

    return (
        <ChatContext.Provider value = {{ socket, onlineUsers}}>
            {children}
        </ChatContext.Provider>
    )

}
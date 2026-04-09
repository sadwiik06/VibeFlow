import React from 'react';
import {useAuth} from '../context/AuthContext';
const HomePage = ()=>{
    const {user,logout} = useAuth();
    return (
        <div>
            <h1> Welcome, {user?.fullName}!</h1>
            <button onClick={logout}>Logout</button>
            <p> This is your feed (coming soon)</p>
        </div>
    );
};

export default HomePage;
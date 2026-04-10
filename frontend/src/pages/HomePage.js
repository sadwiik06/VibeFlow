import React from 'react';
import {useAuth} from '../context/AuthContext';
import Feed from '../components/Feed';
const HomePage = ()=>{
    const {user,logout} = useAuth();
    return (
        <div>
            <Feed />
        </div>
    );
};

export default HomePage;

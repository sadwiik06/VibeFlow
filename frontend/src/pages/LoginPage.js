import React, {useState} from 'react';
import {useNavigate,Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

const LoginPage=()=>{
    const [email , setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const {login} = useAuth();
    const navigate = useNavigate();
    const handleSubmit =async (e) =>{
        e.preventDefault();
        try{
            await login(email,password);
            navigate('/');
        }catch (err){
            setError(err.response ?.data?.message || 'login failed');

        }
    };
    return (
        <div style={{maxWidth: '400px', margin: '50px auto'}}>
            <h2> Login</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder='Email' value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required/>
                <input type="password" placeholder="Password" value={password}  onChange={(e)=>setPassword(e.target.value)}
                required
                />
                <button type="submit"> Login </button>
            </form>
            <p> Don't have an account <Link to="/register">Register</Link></p>

        </div>
    );
};

export default LoginPage;

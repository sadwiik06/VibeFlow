import React, {useState} from 'react';
import {useNavigate,Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

const RegisterPage = () =>{
    const [formData,setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
    });
    const [error,setError] = useState('');
    const {register} = useAuth();
    const navigate = useNavigate();
    const handleChange = (e) =>{
        setFormData({...formData,[e.target.name]: e.target.value});

    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        try{
            await register(formData);
            navigate('/');
        }catch(err){
            setError(err.response?.data?.message || 'Registration failed');
        }
    };
    return (
        <div style={{maxWidth: '480px' , margin: '50px auto'}}>
            <h2>Register</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}> 
                <input name="username"
                placeholder="Username"
                value={formData.username} onChange={handleChange}
                required />
                <input name="email"
                type="email"
                placeholder = "Email"
                value = {formData.email}
                onChange={handleChange} required
                />
                <input 
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                />
                <input name="password"
                type="password"
                placeholder="Password"
                value = {formData.password}
                onChange={handleChange}
                required
                />
                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    )

}

export default RegisterPage;
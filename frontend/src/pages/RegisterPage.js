import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', fullName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="container">
        <div className="card">
          <div className="login">Sign up</div>

          {error && <p className="error-msg">{error}</p>}

          <form onSubmit={handleSubmit} className="form">
            <div className="inputBox">
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
              />
              <span>Full Name</span>
            </div>

            <div className="inputBox">
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
              />
              <span>Username</span>
            </div>

            <div className="inputBox">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
              <span>Email</span>
            </div>

            <div className="inputBox">
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <span>Password</span>
            </div>

            <button className="enter" type="submit" disabled={loading || !formData.email || !formData.password || !formData.username || !formData.fullName}>
              {loading ? <span className="spinner" /> : 'Enter'}
            </button>
          </form>

          <p className="signup-link">
            Already have an account?{' '}
            <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3e3e3;

  .container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login {
    color: #000;
    text-transform: uppercase;
    letter-spacing: 2px;
    display: block;
    font-weight: bold;
    font-size: x-large;
  }

  .card {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 450px;
    width: 350px;
    flex-direction: column;
    gap: 30px;
    background: #e3e3e3;
    box-shadow: 16px 16px 32px #c8c8c8,
          -16px -16px 32px #fefefe;
    border-radius: 8px;
    padding: 30px 20px;
  }

  .form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    width: 100%;
  }

  .inputBox {
    position: relative;
    width: 250px;
  }

  .inputBox input {
    width: 100%;
    padding: 10px;
    outline: none;
    border: none;
    color: #000;
    font-size: 1em;
    background: transparent;
    border-left: 2px solid #000;
    border-bottom: 2px solid #000;
    transition: 0.1s;
    border-bottom-left-radius: 8px;
  }

  .inputBox span {
    margin-top: 5px;
    position: absolute;
    left: 0;
    transform: translateY(-4px);
    margin-left: 10px;
    padding: 10px;
    pointer-events: none;
    font-size: 12px;
    color: #000;
    text-transform: uppercase;
    transition: 0.5s;
    letter-spacing: 3px;
    border-radius: 8px;
  }

  .inputBox input:valid~span,
  .inputBox input:focus~span {
    transform: translateX(113px) translateY(-15px);
    font-size: 0.8em;
    padding: 5px 10px;
    background: #000;
    letter-spacing: 0.2em;
    color: #fff;
    border: 2px;
  }

  .inputBox input:valid,
  .inputBox input:focus {
    border: 2px solid #000;
    border-radius: 8px;
  }

  .enter {
    height: 45px;
    width: 100px;
    border-radius: 5px;
    border: 2px solid #000;
    cursor: pointer;
    background-color: transparent;
    transition: 0.5s;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 2px;
    margin-bottom: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .enter:hover:not(:disabled) {
    background-color: rgb(0, 0, 0);
    color: white;
  }

  .enter:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .error-msg {
    color: #d32f2f;
    font-size: 12px;
    text-align: center;
    margin: 0;
    padding: 0 10px;
    letter-spacing: 0.5px;
  }

  .signup-link {
    font-size: 12px;
    color: #555;
    letter-spacing: 0.5px;
  }

  .signup-link a {
    color: #000;
    font-weight: bold;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .signup-link a:hover {
    text-decoration: underline;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-top-color: #000;
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default RegisterPage;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Sorry, your password was incorrect. Please double-check your password.');
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="container">
        <div className="card">
          <div className="login">Log in</div>

          {error && <p className="error-msg">{error}</p>}

          <form onSubmit={handleSubmit} className="form">
            <div className="inputBox">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              <span className="user">Email</span>
            </div>

            <div className="inputBox">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <span>Password</span>
            </div>

            <button className="enter" type="submit" disabled={loading || !email || !password}>
              {loading ? <span className="spinner" /> : 'Enter'}
            </button>
          </form>

          <p className="signup-link">
            Don't have an account?{' '}
            <Link to="/register">Sign up</Link>
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
    min-height: 350px;
    width: 300px;
    flex-direction: column;
    gap: 35px;
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
    gap: 35px;
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

export default LoginPage;
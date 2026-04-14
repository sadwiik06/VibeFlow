import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const JoinGuildPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('joining'); // 'joining', 'error'
    const [error, setError] = useState('');

    useEffect(() => {
        const join = async () => {
            try {
                const authToken = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/api/guilds/join/${token}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                
                // On success, redirect to the guild page
                navigate(`/guilds/${res.data.guildId}`);
            } catch (err) {
                setStatus('error');
                setError(err.response?.data?.message || 'Invalid or expired invite link');
            }
        };

        if (token) {
            join();
        }
    }, [token, navigate]);

    if (status === 'joining') {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <h2>Joining Guild...</h2>
                <p>Please wait while we process your invitation.</p>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'red' }}>
            <h2>Invitation Failed</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/guilds')} style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '20px' }}>
                Go to Guilds
            </button>
        </div>
    );
};

export default JoinGuildPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const FollowRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState({});

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/users/follow-requests`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load follow requests');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAccept = async (requestId) => {
        setActionLoading(prev => ({ ...prev, [requestId]: 'accepting' }));
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_BASE_URL}/api/users/follow-requests/${requestId}/accept`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (err) {
            console.error('Failed to accept request:', err.response?.data || err.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [requestId]: null }));
        }
    };

    const handleReject = async (requestId) => {
        setActionLoading(prev => ({ ...prev, [requestId]: 'rejecting' }));
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_BASE_URL}/api/users/follow-requests/${requestId}/reject`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (err) {
            console.error('Failed to reject request:', err.response?.data || err.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [requestId]: null }));
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '20px', textAlign: 'center' }}>
                Follow Requests
            </h2>

            {requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8e8e8e' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                    <h3 style={{ margin: '0 0 4px 0', fontWeight: '400', color: '#262626' }}>No pending requests</h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>When people ask to follow you, you'll see their requests here.</p>
                </div>
            ) : (
                <div>
                    {requests.map(request => (
                        <div 
                            key={request._id} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '12px 0', 
                                borderBottom: '1px solid #efefef' 
                            }}
                        >
                            <Link to={`/profile/${request.follower.username}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flex: 1 }}>
                                <img
                                    src={request.follower.profilePicture || '/default-avatar.png'}
                                    alt={request.follower.username}
                                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', marginRight: '12px' }}
                                />
                                <div>
                                    <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#262626' }}>
                                        {request.follower.username}
                                    </p>
                                    {request.follower.fullName && (
                                        <p style={{ margin: 0, fontSize: '12px', color: '#8e8e8e' }}>
                                            {request.follower.fullName}
                                        </p>
                                    )}
                                </div>
                            </Link>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => handleAccept(request._id)}
                                    disabled={!!actionLoading[request._id]}
                                    style={{
                                        padding: '5px 16px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: '#0095f6',
                                        color: '#fff',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                    }}
                                >
                                    {actionLoading[request._id] === 'accepting' ? '...' : 'Confirm'}
                                </button>
                                <button
                                    onClick={() => handleReject(request._id)}
                                    disabled={!!actionLoading[request._id]}
                                    style={{
                                        padding: '5px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #dbdbdb',
                                        backgroundColor: '#fff',
                                        color: '#262626',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                    }}
                                >
                                    {actionLoading[request._id] === 'rejecting' ? '...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FollowRequestsPage;

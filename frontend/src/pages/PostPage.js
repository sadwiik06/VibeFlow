import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Post from '../components/Post';
import API_BASE_URL from '../apiConfig';

const PostPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/api/posts/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPost(res.data);
            } catch (err) {
                setError('Failed to load post. It may have been deleted or you do not have permission to view it.');
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

    const handleDelete = (deletedPostId) => {
        navigate('/');
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}><div className="spinner"></div></div>;

    if (error) return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Post Not Found</h2>
            <p style={{ color: '#8e8e8e', marginTop: '10px' }}>{error}</p>
            <button 
                onClick={() => navigate('/')}
                style={{ marginTop: '20px', padding: '10px 20px', background: '#0A0A0A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                Return Home
            </button>
        </div>
    );

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '20px', paddingBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', padding: '0 15px' }}>Post</h2>
            {post && <Post post={post} user={user} onDelete={handleDelete} />}
        </div>
    );
};

export default PostPage;

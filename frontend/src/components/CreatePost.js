import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CreatePost = ({ onPostCreated }) => {
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [media, setMedia] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const [postType, setPostType] = useState('post');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMedia(file);
            setPreview(URL.createObjectURL(file));
            // Auto-detect type from file
            if (file.type.startsWith('video/')) {
                setPostType('reel');
            } else {
                setPostType('post');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!media) {
            setError('Please select a file');
            return;
        }
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('media', media);
        formData.append('caption', caption);
        formData.append('location', location);
        formData.append('type', postType);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            onPostCreated(res.data);
            setCaption('');
            setLocation('');
            setMedia(null);
            setPreview('');
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ marginTop: 0 }}>Create New Post</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <input 
                        type="file" 
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        required
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>
                        <input
                            type="radio"
                            value="post"
                            checked={postType === 'post'}
                            onChange={() => setPostType('post')}
                        /> Post
                    </label>
                    <label style={{ marginLeft: '10px' }}>
                        <input
                            type="radio"
                            value="reel"
                            checked={postType === 'reel'}
                            onChange={() => setPostType('reel')}
                        /> Reel
                    </label>
                </div>

                {preview && (
                    <div style={{ marginBottom: '10px' }}>
                        {media && media.type.startsWith('image/') ? (
                            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} />
                        ) : (
                            <video src={preview} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} />
                        )}
                    </div>
                )}

                <textarea 
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows="3"
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                
                <input 
                    type="text"
                    placeholder="Add location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: '100%', marginTop: '5px', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                
                <button 
                    type="submit" 
                    disabled={loading} 
                    style={{ 
                        marginTop: '10px', 
                        width: '100%', 
                        padding: '10px', 
                        backgroundColor: '#007bff', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Posting...' : 'Share'}
                </button>
            </form>
        </div>
    );
};

export default CreatePost;

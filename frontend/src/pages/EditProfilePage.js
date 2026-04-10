import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EditProfilePage = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        website: '',
        isPrivate: false,
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                bio: user.bio || '',
                website: user.website || '',
                isPrivate: user.isPrivate || false,
            });
            setPreview(user.profilePicture || '');
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const data = new FormData();
        data.append('fullName', formData.fullName);
        data.append('bio', formData.bio);
        data.append('website', formData.website);
        data.append('isPrivate', formData.isPrivate);
        if (profilePicture) {
            data.append('profilePicture', profilePicture);
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/users/profile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            });
            setUser({ ...user, ...res.data });
            // Navigate immediately to profile page
            navigate(`/profile/${user.username}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div>Please log in to edit your profile.</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', backgroundColor: '#fff', border: '1px solid #dbdbdb', borderRadius: '3px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Edit Profile</h2>
            
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{ width: '100px', marginRight: '30px' }}>
                        <img 
                            src={preview || '/default-avatar.png'} 
                            alt="Preview" 
                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>{user.username}</h3>
                        <label htmlFor="profilePicture" style={{ color: '#0095f6', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                            Change Profile Photo
                        </label>
                        <input 
                            type="file" 
                            id="profilePicture"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Full Name</label>
                    <input 
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '3px', border: '1px solid #dbdbdb', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Bio</label>
                    <textarea 
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="3"
                        style={{ width: '100%', padding: '10px', borderRadius: '3px', border: '1px solid #dbdbdb', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Website</label>
                    <input 
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '3px', border: '1px solid #dbdbdb', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center' }}>
                    <input 
                        type="checkbox"
                        id="isPrivate"
                        name="isPrivate"
                        checked={formData.isPrivate}
                        onChange={handleChange}
                        style={{ marginRight: '10px' }}
                    />
                    <label htmlFor="isPrivate" style={{ fontWeight: '600' }}>Private Account</label>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        backgroundColor: '#0095f6', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontWeight: '600', 
                        cursor: loading ? 'not-allowed' : 'pointer' 
                    }}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default EditProfilePage;
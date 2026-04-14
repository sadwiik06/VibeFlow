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
        <div style={{ 
            maxWidth: '540px', 
            margin: '50px auto', 
            padding: '35px 40px', 
            backgroundColor: '#fff', 
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)', 
            borderRadius: '20px' 
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#1a1a1a' }}>Edit Profile</h2>
            
            {error && <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
            {success && <div style={{ padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{success}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '35px', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ marginRight: '25px', position: 'relative' }}>
                        <img 
                            src={preview || '/default-avatar.png'} 
                            alt="Preview" 
                            style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f5f5f5' }}
                        />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{user.identifier || user.username}</h3>
                        <label htmlFor="profilePicture" style={{ display: 'inline-block', color: '#1a1a1a', background: '#f5f5f5', padding: '6px 14px', borderRadius: '20px', fontWeight: '600', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}>
                            Update Photo
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

                <div style={{ marginBottom: '22px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Full Name</label>
                    <input 
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #eaeaea', backgroundColor: '#fafafa', fontSize: '14px', outline: 'none', transition: 'border 0.2s' }}
                        onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
                        onBlur={(e) => e.target.style.borderColor = '#eaeaea'}
                    />
                </div>

                <div style={{ marginBottom: '22px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Bio</label>
                    <textarea 
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="3"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #eaeaea', backgroundColor: '#fafafa', fontSize: '14px', outline: 'none', resize: 'vertical', transition: 'border 0.2s' }}
                        onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
                        onBlur={(e) => e.target.style.borderColor = '#eaeaea'}
                    />
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Website</label>
                    <input 
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #eaeaea', backgroundColor: '#fafafa', fontSize: '14px', outline: 'none', transition: 'border 0.2s' }}
                        onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
                        onBlur={(e) => e.target.style.borderColor = '#eaeaea'}
                    />
                </div>

                <div style={{ marginBottom: '35px', display: 'flex', alignItems: 'center', background: '#fcfcfc', padding: '15px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                    <input 
                        type="checkbox"
                        id="isPrivate"
                        name="isPrivate"
                        checked={formData.isPrivate}
                        onChange={handleChange}
                        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1a1a1a' }}
                    />
                    <div>
                        <label htmlFor="isPrivate" style={{ fontWeight: '600', color: '#1a1a1a', cursor: 'pointer', display: 'block', marginBottom: '2px' }}>Private Account</label>
                        <span style={{ fontSize: '12px', color: '#8e8e8e' }}>Only approved followers can see your content.</span>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: '100%', 
                        padding: '14px', 
                        backgroundColor: '#1a1a1a', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '30px', 
                        fontWeight: '700', 
                        fontSize: '15px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'transform 0.1s, opacity 0.2s',
                        opacity: loading ? 0.7 : 1
                    }}
                    onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default EditProfilePage;
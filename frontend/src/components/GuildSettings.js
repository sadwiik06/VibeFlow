import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GuildSettings = ({ guild, onUpdate }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const token = localStorage.getItem('token');
    
    // Check if current user is owner
    const isOwner = guild.owner._id?.toString() === currentUser?._id?.toString();

    const [formData, setFormData] = useState({
        name: guild.name,
        description: guild.description,
        topic: guild.topic,
        type: guild.type
    });
    const [coverImage, setCoverImage] = useState(null);
    const [preview, setPreview] = useState(guild.coverImage);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [newOwnerId, setNewOwnerId] = useState('');

    const topics = ['Movies', 'AI/ML', 'Gaming', 'Music', 'Books', 'Tech', 'Sports', 'Art'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('topic', formData.topic);
        data.append('type', formData.type);
        if (coverImage) data.append('coverImage', coverImage);

        try {
            await axios.put(`http://localhost:5000/api/guilds/${guild._id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            onUpdate();
            alert('Guild updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update guild');
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async () => {
        if (!newOwnerId) return alert('Please select a new owner');
        if (!window.confirm('Are you sure? You will lose ownership of this guild.')) return;

        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/guilds/${guild._id}/transfer`, 
                { newOwnerId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Ownership transferred!');
            onUpdate();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to transfer ownership');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('PERMANENTLY DELETE GUILD? This cannot be undone.')) return;

        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/guilds/${guild._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Guild deleted.');
            navigate('/guilds');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete guild');
            setLoading(false);
        }
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
            <div style={{ maxWidth: '540px', margin: '0 auto', padding: '35px 20px' }}>
            <h2 style={{ marginBottom: '30px', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#1a1a1a' }}>Guild Settings</h2>
            {error && <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', marginBottom: '30px' }}>
                <div style={{ marginBottom: '35px', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '12px', fontSize: '14px', color: '#1a1a1a' }}>Cover Image</label>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                        {preview ? (
                            <img src={preview} alt="" style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', border: '3px solid #f5f5f5' }} />
                        ) : (
                            <div style={{ width: '120px', height: '120px', borderRadius: '12px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: '#8e8e8e', fontSize: '12px' }}>No Image</span>
                            </div>
                        )}
                        <div>
                            <label className="file-upload-lbl" style={{ display: 'inline-block', color: '#1a1a1a', background: '#f5f5f5', padding: '8px 16px', borderRadius: '20px', fontWeight: '600', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}>
                                Choose Image
                                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                            </label>
                            <p style={{ fontSize: '12px', color: '#8e8e8e', marginTop: '8px' }}>JPEG or PNG. Max 5MB.</p>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '22px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Guild Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} required 
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #eaeaea', backgroundColor: '#fafafa', fontSize: '14px', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
                        onFocus={(e) => e.target.style.borderColor = '#1a1a1a'} onBlur={(e) => e.target.style.borderColor = '#eaeaea'}
                    />
                </div>

                <div style={{ marginBottom: '22px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="3" 
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #eaeaea', backgroundColor: '#fafafa', fontSize: '14px', outline: 'none', resize: 'vertical', transition: 'border 0.2s', boxSizing: 'border-box' }}
                        onFocus={(e) => e.target.style.borderColor = '#1a1a1a'} onBlur={(e) => e.target.style.borderColor = '#eaeaea'}
                    />
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Topic</label>
                    <select name="topic" value={formData.topic} onChange={handleChange} 
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #eaeaea', backgroundColor: '#fafafa', fontSize: '14px', outline: 'none', transition: 'border 0.2s', appearance: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
                        onFocus={(e) => e.target.style.borderColor = '#1a1a1a'} onBlur={(e) => e.target.style.borderColor = '#eaeaea'}
                    >
                        {topics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: '35px', display: 'flex', gap: '30px', background: '#fcfcfc', padding: '15px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: '600', color: '#1a1a1a', fontSize: '14px' }}>
                        <input type="radio" name="type" value="public" checked={formData.type === 'public'} onChange={handleChange} style={{ marginRight: '8px', accentColor: '#1a1a1a', width: '16px', height: '16px' }} /> 
                        Public Guild
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: '600', color: '#1a1a1a', fontSize: '14px' }}>
                        <input type="radio" name="type" value="private" checked={formData.type === 'private'} onChange={handleChange} style={{ marginRight: '8px', accentColor: '#1a1a1a', width: '16px', height: '16px' }} /> 
                        Private Guild
                    </label>
                </div>

                <button type="submit" disabled={loading} 
                    style={{ width: '100%', padding: '14px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: '700', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'transform 0.1s, opacity 0.2s', opacity: loading ? 0.7 : 1 }}
                    onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'} onMouseUp={(e) => e.target.style.transform = 'scale(1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    {loading ? 'Saving...' : 'Update Guild Options'}
                </button>
            </form>

            {isOwner && (
                <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '800', color: '#c62828' }}>Danger Zone</h3>
                    
                    <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#fffcfc', border: '1.5px solid #ffebeb', borderRadius: '12px' }}>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#1a1a1a' }}>Transfer Ownership</h4>
                        <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#8e8e8e', lineHeight: '1.4' }}>Transfer leadership to another member. You will lose owner privileges.</p>
                        <select 
                            value={newOwnerId} 
                            onChange={(e) => setNewOwnerId(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #eaeaea', backgroundColor: '#fafafa', fontSize: '14px', outline: 'none', marginBottom: '15px', boxSizing: 'border-box', cursor: 'pointer' }}
                        >
                            <option value="">Select a member...</option>
                            {guild.members.filter(m => m._id !== currentUser?._id).map(m => (
                                <option key={m._id} value={m._id}>{m.username}</option>
                            ))}
                        </select>
                        <button onClick={handleTransfer} disabled={loading || !newOwnerId} 
                            style={{ width: '100%', padding: '12px', backgroundColor: '#fff', color: '#f57c00', border: '1.5px solid #f57c00', borderRadius: '30px', fontWeight: '700', fontSize: '14px', cursor: (loading||!newOwnerId) ? 'not-allowed' : 'pointer', opacity: (loading||!newOwnerId) ? 0.5 : 1 }}
                        >
                            Transfer Ownership
                        </button>
                    </div>

                    <div style={{ padding: '20px', backgroundColor: '#fffcfc', border: '1.5px solid #ffebeb', borderRadius: '12px' }}>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#1a1a1a' }}>Delete Guild</h4>
                        <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#8e8e8e', lineHeight: '1.4' }}>Permanently remove this guild and all of its content. This action cannot be undone.</p>
                        <button onClick={handleDelete} disabled={loading} 
                            style={{ width: '100%', padding: '12px', backgroundColor: '#c62828', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: '700', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
                        >
                            Delete Guild Forever
                        </button>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default GuildSettings;

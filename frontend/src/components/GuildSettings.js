import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GuildSettings = ({ guild, onUpdate }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    
    // Check if current user is owner
    const currentUserId = JSON.parse(atob(token.split('.')[1])).id;
    const isOwner = guild.owner._id === currentUserId;

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
        <div style={{ padding: '20px', maxWidth: '600px' }}>
            <h2>Guild Settings</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Cover Image</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'block', marginTop: '5px' }} />
                    {preview && <img src={preview} alt="" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', marginTop: '10px', borderRadius: '8px' }} />}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Guild Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="3" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Topic</label>
                    <select name="topic" value={formData.topic} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                        {topics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ marginRight: '20px' }}>
                        <input type="radio" name="type" value="public" checked={formData.type === 'public'} onChange={handleChange} /> Public
                    </label>
                    <label>
                        <input type="radio" name="type" value="private" checked={formData.type === 'private'} onChange={handleChange} /> Private
                    </label>
                </div>

                <button type="submit" disabled={loading} style={{ background: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {loading ? 'Saving...' : 'Update Guild Details'}
                </button>
            </form>

            {isOwner && (
                <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <h3 style={{ color: '#d9534f' }}>Danger Zone</h3>
                    
                    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ffcccc', borderRadius: '8px' }}>
                        <h4>Transfer Ownership</h4>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>Pass leadership to another member.</p>
                        <select 
                            value={newOwnerId} 
                            onChange={(e) => setNewOwnerId(e.target.value)}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select a member...</option>
                            {guild.members.filter(m => m._id !== currentUserId).map(m => (
                                <option key={m._id} value={m._id}>{m.username}</option>
                            ))}
                        </select>
                        <button onClick={handleTransfer} disabled={loading || !newOwnerId} style={{ background: '#f0ad4e', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Transfer Ownership
                        </button>
                    </div>

                    <div style={{ padding: '15px', border: '1px solid #ffcccc', borderRadius: '8px' }}>
                        <h4>Delete Guild</h4>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>Once deleted, all data is gone forever.</p>
                        <button onClick={handleDelete} disabled={loading} style={{ background: '#d9534f', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Delete Guild Forever
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuildSettings;

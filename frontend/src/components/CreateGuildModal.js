import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const CreateGuildModal = ({ onClose, onCreated }) => {

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        topic: 'Movies',
        type: 'public',
    });

    const [coverImage, setCoverImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const topics = ['Movies', 'AI/ML', 'Gaming', 'Music', 'Books', 'Tech', 'Sports', 'Art'];
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/guilds`, data, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            onCreated(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create guild');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 style={{marginTop: 0}}>Create Guild</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Cover Image (optional)</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{display: 'block', marginTop: '5px'}}/>
                        {preview && <img src={preview} alt="" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', marginTop: '10px' }} />}
                    </div>
                    <input
                        name="name"
                        placeholder="Guild name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }} 
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
                    />
                    <select name="topic" value={formData.topic} onChange={handleChange} style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}>
                        {topics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{marginRight: '20px'}}>
                            <input type="radio" name="type" value="public" checked={formData.type === 'public'} onChange={handleChange} /> Public
                        </label>
                        <label>
                            <input type="radio" name="type" value="private" checked={formData.type === 'private'} onChange={handleChange} /> Private
                        </label>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '8px 16px', cursor: 'pointer', background: '#ccc', border: 'none', borderRadius: '4px' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={{ padding: '8px 16px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                            {loading ? 'Creating...' : 'Create Guild'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGuildModal;
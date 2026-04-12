import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import GuildChat from '../components/GuildChat';
import GuildMembers from '../components/GuildMembers';
import GuildSettings from '../components/GuildSettings';

const GuildDetailPage = () => {
    const { guildId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket } = useChat();
    const [guild, setGuild] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('chat');
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchGuild();
        if (socket) {
            socket.emit('join guild', guildId);
        }
        return () => {
            if (socket) socket.emit('leave guild', guildId);
        };
    }, [guildId, socket]);

    const fetchGuild = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/guilds/${guildId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGuild(res.data);
            setLoading(false);
        } catch (err) {
            setError('Guild not found or access denied');
            setLoading(false);
        }
    };

    const isMember = guild?.members?.some(m => m._id === user._id || m === user._id);
    const isOwner = guild?.owner?._id === user._id;
    const isAdmin = guild?.memberRoles?.find(m => m.user === user._id)?.role === 'admin';
    const canManage = isOwner || isAdmin;

    const handleJoin = async () => {
        try {
            await axios.post(`http://localhost:5000/api/guilds/${guildId}/join`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchGuild();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to join');
        }
    };

    const handleLeave = async () => {
        if (window.confirm('Leave this guild?')) {
            try {
                await axios.post(`http://localhost:5000/api/guilds/${guildId}/leave`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                navigate('/guilds');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to leave');
            }
        }
    };

    if (loading) return <div>Loading guild...</div>;
    if (error) return <div>{error}</div>;
    if (!guild) return <div>Guild not found</div>;

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
            <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '15px', overflowY: 'auto' }}>
                {guild.coverImage && <img src={guild.coverImage} alt="" style={{ width: '100%', borderRadius: '8px' }} />}
                <h2>{guild.name}</h2>
                <p>{guild.description}</p>
                <p><strong>Topic:</strong> {guild.topic}</p>
                <p><strong>Members:</strong> {guild.memberCount || guild.members?.length}</p>
                <p><strong>Owner:</strong> {guild.owner.username}</p>
                
                {!isMember && guild.type === 'public' && (
                    <button onClick={handleJoin} style={{ width: '100%', padding: '8px', marginTop: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Join Guild
                    </button>
                )}

                {!isMember && guild.type === 'private' && (
                    <button onClick={handleJoin} style={{ width: '100%', padding: '8px', marginTop: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Request to join
                    </button>
                )}

                {isMember && !isOwner && (
                    <button onClick={handleLeave} style={{ width: '100%', padding: '8px', marginTop: '10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Leave Guild
                    </button>
                )}

                {canManage && guild.inviteToken && (
                    <div style={{ marginTop: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', fontWeight: 'bold' }}>Invite Link</p>
                        <input 
                            readOnly 
                            value={`${window.location.origin}/guilds/join/${guild.inviteToken}`}
                            style={{ width: '100%', fontSize: '0.7rem', padding: '5px' }}
                            onClick={(e) => e.target.select()}
                        />
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/guilds/join/${guild.inviteToken}`);
                                alert('Link copied to clipboard!');
                            }}
                            style={{ width: '100%', marginTop: '5px', padding: '5px', fontSize: '0.7rem', cursor: 'pointer' }}
                        >
                            Copy Link
                        </button>
                    </div>
                )}

                <div style={{ marginTop: '20px' }}>
                    <button onClick={() => setActiveTab('chat')} style={{ display: 'block', width: '100%', padding: '8px', textAlign: 'left', background: activeTab === 'chat' ? '#f0f0f0' : 'none', border: 'none', cursor: 'pointer' }}>💬 Chat</button>
                    <button onClick={() => setActiveTab('members')} style={{ display: 'block', width: '100%', padding: '8px', textAlign: 'left', background: activeTab === 'members' ? '#f0f0f0' : 'none', border: 'none', cursor: 'pointer' }}>👥 Members</button>
                </div>
            </div>

            {/* Main content area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {!isMember && guild.type === 'private' && (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <h3>This guild is private</h3>
                        <p>Request to join or use an invite link.</p>
                    </div>
                )}
                {isMember && activeTab === 'chat' && <GuildChat guildId={guildId} />}
                {isMember && activeTab === 'members' && <GuildMembers guild={guild} onRefresh={fetchGuild} canManage={canManage} />}
                {isMember && activeTab === 'settings' && canManage && <GuildSettings guild={guild} onUpdate={fetchGuild} />}
            </div>
        </div>
    );
};

export default GuildDetailPage;
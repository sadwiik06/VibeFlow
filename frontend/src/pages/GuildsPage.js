import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CreateGuildModal from '../components/CreateGuildModal';

const GuildsPage = () => {
    const [publicGuilds, setPublicGuilds] = useState([]);
    const [myGuilds, setMyGuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('discover');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Separate input state and actual search term for debouncing
    const [searchInput, setSearchInput] = useState(''); 
    const [searchTerm, setSearchTerm] = useState('');
    
    const [topicFilter, setTopicFilter] = useState('');
    const { user } = useAuth();
    const token = localStorage.getItem('token');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchGuilds();
    }, [searchTerm, topicFilter, activeTab]);

    const fetchGuilds = async () => {
        setLoading(true);
        try {
            if (activeTab === 'discover') {
                const publicRes = await axios.get(
                    `http://localhost:5000/api/guilds?search=${searchTerm}&topic=${topicFilter}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setPublicGuilds(publicRes.data);
            } else {
                const myRes = await axios.get(
                    `http://localhost:5000/api/guilds/my`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setMyGuilds(myRes.data);
            }
        } catch (err) {
            console.error('Error fetching guilds', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGuildCreated = (newGuild) => {
        setMyGuilds([newGuild, ...myGuilds]);
        if (newGuild.type === 'public') {
            setPublicGuilds([newGuild, ...publicGuilds]);
        }
        setShowCreateModal(false);
    };

    const topics = ['Movies', 'AI/ML', 'Gaming', 'Music', 'Books', 'Tech', 'Sports', 'Art'];

    return (
        <div style={{ maxWidth: '900px', margin: '20px auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Guilds</h1>
                <button onClick={() => setShowCreateModal(true)} style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create Guild</button>
            </div>
            
            <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
                <button
                    onClick={() => setActiveTab('discover')}
                    style={{ padding: '10px 20px', background: activeTab === 'discover' ? '#007bff' : 'none', color: activeTab === 'discover' ? 'white' : 'black', border: 'none', borderRadius: '4px 4px 0 0', cursor: 'pointer' }}
                >
                    Discover
                </button>
                <button
                    onClick={() => setActiveTab('my')}
                    style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'my' ? '2px solid black' : 'none', cursor: 'pointer' }}
                >
                    My Guilds
                </button>
            </div>
            
            {activeTab === 'discover' && (
                <div style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
                    <input type="text"
                        placeholder="Search guild..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="">All topics</option>
                        {topics.map(t =>
                            <option key={t} value={t}>{t}</option>
                        )}
                    </select>
                </div>
            )}

            {loading ? (
                <div style={{textAlign: 'center', padding: '40px'}}>Loading guilds...</div>
            ) : (
                <>
                    {activeTab === 'discover' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                            {publicGuilds.length > 0 ? (
                                publicGuilds.map((guild) => (
                                    <GuildCard key={guild._id} guild={guild} />
                                ))
                            ) : (
                                <p>No guilds found.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'my' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                            {myGuilds.length > 0 ? (
                                myGuilds.map(guild => (
                                    <GuildCard key={guild._id} guild={guild} />
                                ))
                            ) : (
                                <p>You haven't joined any guilds yet.</p>
                            )}
                        </div>
                    )}
                </>
            )}

            {showCreateModal && (
                <CreateGuildModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleGuildCreated}
                />
            )}
        </div>
    );
};

const GuildCard = ({ guild }) => {
    if (!guild) return null;
    return (
        <Link to={`/guilds/${guild._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '120px', backgroundColor: '#f0f0f0', position: 'relative' }}>
                    {guild.coverImage && <img src={guild.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ padding: '10px', flex: 1 }}>
                    <h3 style={{ margin: '5px 0' }}>{guild.name}</h3>
                    <p style={{ color: '#666', margin: '5px 0', fontSize: '0.9rem' }}>{guild.topic}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <p style={{ fontSize: '0.8rem', margin: 0 }}>{guild.memberCount || guild.members?.length || 0} members</p>
                        <span style={{ background: '#e0e0e0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem' }}>
                            {guild.type}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default GuildsPage;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Post from '../components/Post';

const ProfilePage = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const res = await axios.get(`http://localhost:5000/api/users/${username}`, config);
            setProfile(res.data);
            setIsFollowing(res.data.isFollowing);

            const postRes = await axios.get(`http://localhost:5000/api/posts/user/${res.data._id}`, config);
            setPosts(postRes.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load profile');
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchProfile();
    }, [username]);

    const handleFollow = async () => {
        if (!currentUser) return;
        setFollowLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `http://localhost:5000/api/users/${profile._id}/follow`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsFollowing(res.data.isFollowing);
            setProfile(prev => ({
                ...prev,
                followers: res.data.isFollowing 
                    ? [...prev.followers, { _id: currentUser._id, username: currentUser.username }]
                    : prev.followers.filter(f => f._id !== currentUser._id)
            }));
        } catch (err) {
            console.error('[handleFollow] error:', err.response?.data || err.message);
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading profile...</div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
    if (!profile) return <div style={{ textAlign: 'center', marginTop: '50px' }}>User not found</div>;

    const isOwnProfile = currentUser?.username === username;

    return (
        <div style={{ maxWidth: '935px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', padding: '30px 0', borderBottom: '1px solid #dbdbdb' }}>
                <img 
                    src={profile.profilePicture || '/default-avatar.png'}
                    alt={profile.username} 
                    style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginRight: '80px' }}
                />
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                        <h2 style={{ fontWeight: '300', fontSize: '28px', margin: 0 }}>{profile.username}</h2>
                        {isOwnProfile ? (
                            <Link to="/accounts/edit">
                                <button style={{ padding: '5px 9px', borderRadius: '4px', border: '1px solid #dbdbdb', backgroundColor: 'transparent', fontWeight: '600', cursor: 'pointer' }}>
                                    Edit Profile
                                </button>
                            </Link>
                        ) : (
                            <button 
                                onClick={handleFollow} 
                                disabled={followLoading}
                                style={{ 
                                    padding: '5px 24px', 
                                    borderRadius: '4px', 
                                    border: 'none', 
                                    backgroundColor: isFollowing ? '#efefef' : '#0095f6', 
                                    color: isFollowing ? '#000' : '#fff', 
                                    fontWeight: '600', 
                                    cursor: 'pointer' 
                                }}
                            >
                                {followLoading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
                            </button>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
                        <span><strong>{posts.length}</strong> posts</span>
                        <span><strong>{profile.followers?.length || 0}</strong> followers</span>
                        <span><strong>{profile.following?.length || 0}</strong> following</span>
                    </div>
                    
                    <div>
                        <p style={{ fontWeight: '600', margin: '0 0 5px 0' }}>{profile.fullName}</p>
                        <p style={{ margin: 0 }}>{profile.bio}</p>
                        {profile.website && (
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: '#00376b', textDecoration: 'none', fontWeight: '600' }}>
                                {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
                {posts.map(post => (
                    <div key={post._id} style={{ position: 'relative', width: '100%', paddingBottom: '100%', overflow: 'hidden' }}>
                        {post.type === 'post' ? (
                            <img 
                                src={post.mediaUrl} 
                                alt="" 
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <video 
                                src={post.mediaUrl} 
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        )}
                    </div>
                ))}
            </div>
            {posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '50px 0', color: '#8e8e8e' }}>
                    <h3 style={{ margin: 0 }}>No Posts Yet</h3>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
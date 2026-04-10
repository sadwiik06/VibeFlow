import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isAccountPrivate, setIsAccountPrivate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [followStatus, setFollowStatus] = useState('none'); // 'none', 'pending', 'accepted'
    const [followLoading, setFollowLoading] = useState(false);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const res = await axios.get(`http://localhost:5000/api/users/${username}`, config);
            setProfile(res.data);
            setFollowStatus(res.data.followStatus || 'none');

            const postRes = await axios.get(`http://localhost:5000/api/posts/user/${res.data._id}`, config);
            setPosts(postRes.data.posts || []);
            setIsAccountPrivate(postRes.data.isPrivate || false);
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
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post(
                `http://localhost:5000/api/users/${profile._id}/follow`,
                {},
                config
            );
            setFollowStatus(res.data.followStatus);

            if (res.data.followStatus === 'accepted') {
                // Became a follower — update follower list & re-fetch posts
                setProfile(prev => ({
                    ...prev,
                    followers: [...(prev.followers || []), { _id: currentUser._id, username: currentUser.username }]
                }));
                const postRes = await axios.get(
                    `http://localhost:5000/api/posts/user/${profile._id}`, config
                );
                setPosts(postRes.data.posts || []);
                setIsAccountPrivate(postRes.data.isPrivate || false);
            } else if (res.data.followStatus === 'none') {
                // Unfollowed or cancelled request
                setProfile(prev => ({
                    ...prev,
                    followers: (prev.followers || []).filter(f => f._id !== currentUser._id)
                }));
                // Re-fetch posts — might lose access if private
                const postRes = await axios.get(
                    `http://localhost:5000/api/posts/user/${profile._id}`, config
                );
                setPosts(postRes.data.posts || []);
                setIsAccountPrivate(postRes.data.isPrivate || false);
            }
            // 'pending' — no post changes needed
        } catch (err) {
            console.error('[handleFollow] error:', err.response?.data || err.message);
        } finally {
            setFollowLoading(false);
        }
    };

    const getFollowButtonText = () => {
        if (followLoading) return '...';
        if (followStatus === 'accepted') return 'Unfollow';
        if (followStatus === 'pending') return 'Requested';
        return 'Follow';
    };

    const getFollowButtonStyle = () => {
        const base = {
            padding: '5px 24px',
            borderRadius: '4px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
        };
        if (followStatus === 'accepted') {
            return { ...base, backgroundColor: '#efefef', color: '#000' };
        }
        if (followStatus === 'pending') {
            return { ...base, backgroundColor: '#efefef', color: '#000' };
        }
        return { ...base, backgroundColor: '#0095f6', color: '#fff' };
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading profile...</div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
    if (!profile) return <div style={{ textAlign: 'center', marginTop: '50px' }}>User not found</div>;

    const isOwnProfile = currentUser?.username === username;
    const isPrivateAndLocked = profile.isPrivateAndNotFollowing;

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
                        <h2 style={{ fontWeight: '300', fontSize: '28px', margin: 0 }}>
                            {profile.username}
                            {profile.isPrivate && (
                                <span style={{ fontSize: '16px', marginLeft: '8px' }} title="Private Account">🔒</span>
                            )}
                        </h2>
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
                                style={getFollowButtonStyle()}
                            >
                                {getFollowButtonText()}
                            </button>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
                        <span><strong>{isPrivateAndLocked ? profile.postsCount : posts.length}</strong> posts</span>
                        {isPrivateAndLocked ? (
                            <>
                                <span><strong>{profile.followersCount || 0}</strong> followers</span>
                                <span><strong>{profile.followingCount || 0}</strong> following</span>
                            </>
                        ) : (
                            <>
                                <span><strong>{profile.followers?.length || 0}</strong> followers</span>
                                <span><strong>{profile.following?.length || 0}</strong> following</span>
                            </>
                        )}
                    </div>
                    
                    {!isPrivateAndLocked && (
                        <div>
                            <p style={{ fontWeight: '600', margin: '0 0 5px 0' }}>{profile.fullName}</p>
                            <p style={{ margin: 0 }}>{profile.bio}</p>
                            {profile.website && (
                                <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: '#00376b', textDecoration: 'none', fontWeight: '600' }}>
                                    {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isAccountPrivate || isPrivateAndLocked ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', borderTop: '1px solid #dbdbdb' }}>
                    <div style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #262626',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', fontSize: '36px'
                    }}>🔒</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '22px' }}>This Account is Private</h3>
                    <p style={{ color: '#8e8e8e', margin: 0, fontSize: '14px' }}>
                        Follow this account to see their photos and videos.
                    </p>
                </div>
            ) : (
                <>
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
                        <div style={{ textAlign: 'center', padding: '50px 0', color: '#8e8e8e', borderTop: '1px solid #dbdbdb' }}>
                            <h3 style={{ margin: 0 }}>No Posts Yet</h3>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProfilePage;
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Post from '../components/Post';
import API_BASE_URL from '../apiConfig';

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isAccountPrivate, setIsAccountPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followStatus, setFollowStatus] = useState('none');
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { 
    setLoading(true); 
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/${username}`, config);
        setProfile(res.data);
        setFollowStatus(res.data.followStatus || 'none');
        const postRes = await axios.get(`${API_BASE_URL}/api/posts/user/${res.data._id}`, config);
        setPosts(postRes.data.posts || []);
        setIsAccountPrivate(postRes.data.isPrivate || false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile(); 
    setSelectedPost(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, activeTab]);

  const handleFollow = async () => {
    if (!currentUser) return;
    setFollowLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/${profile._id}/follow`, {}, config);
      setFollowStatus(res.data.followStatus);
      if (res.data.followStatus === 'accepted') {
        setProfile(prev => ({ ...prev, followers: [...(prev.followers || []), { _id: currentUser._id }] }));
        const postRes = await axios.get(`${API_BASE_URL}/api/posts/user/${profile._id}`, config);
        setPosts(postRes.data.posts || []);
        setIsAccountPrivate(postRes.data.isPrivate || false);
      } else if (res.data.followStatus === 'none') {
        setProfile(prev => ({ ...prev, followers: (prev.followers || []).filter(f => f._id !== currentUser._id) }));
        const postRes = await axios.get(`${API_BASE_URL}/api/posts/user/${profile._id}`, config);
        setPosts(postRes.data.posts || []);
        setIsAccountPrivate(postRes.data.isPrivate || false);
      }
    } catch (err) { console.error(err); }
    finally { setFollowLoading(false); }
  };

  const handleMessage = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat/conversations`, { userId: profile._id }, config);
      navigate('/chat', { state: { conversationId: res.data._id } });
    } catch (err) { console.error(err); }
  };

  const isOwnProfile = currentUser?.username === username;
  const isPrivateAndLocked = profile?.isPrivateAndNotFollowing;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 14 }}>
      Loading…
    </div>
  );
  if (error || !profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#ff3b30', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 14 }}>
      {error || 'User not found'}
    </div>
  );

  const followBtnStyle = (() => {
    const base = {
      padding: '8px 22px', borderRadius: '10px',
      fontWeight: '700', cursor: 'pointer', fontSize: '13px',
      fontFamily: 'inherit', border: 'none',
      transition: 'opacity 0.15s, transform 0.1s',
    };
    if (followStatus === 'accepted') return { ...base, background: '#F0F0F0', color: '#1a1a1a' };
    if (followStatus === 'pending') return { ...base, background: '#F0F0F0', color: '#888' };
    return { ...base, background: '#1a1a1a', color: '#fff' };
  })();

  const followBtnText = followLoading ? '…' : followStatus === 'accepted' ? 'Following' : followStatus === 'pending' ? 'Requested' : 'Follow';

  const renderListModal = (title, list, onClose) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '12px', width: '90%', maxWidth: '400px', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '16px', borderBottom: '1px solid #efefef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: '#1a1a1a' }}>
          {title}
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#1a1a1a' }}>&times;</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '8px' }}>
          {list?.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No users found.</div>}
          {list?.map(u => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '12px', cursor: 'pointer' }} onClick={() => { onClose(); navigate(`/profile/${u.username}`); }}>
              <img src={u.profilePicture || '/default-avatar.png'} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1a1a1a' }}>{u.username}</div>
                <div style={{ fontSize: '13px', color: '#888' }}>{u.fullName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .profile-page {
          max-width: 935px; margin: 0 auto;
          padding: 36px 24px 80px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Header */
        .profile-header {
          display: flex; align-items: flex-start; gap: 56px;
          margin-bottom: 36px;
        }

        /* Avatar */
        .profile-avatar-wrap {
          flex-shrink: 0; width: 120px; height: 120px;
          border-radius: 50%; padding: 3px;
          background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
        }
        .profile-avatar-inner { background: #fff; border-radius: 50%; padding: 2px; width: 100%; height: 100%; }
        .profile-avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
        .profile-avatar-default {
          width: 100%; height: 100%; border-radius: 50%;
          background: linear-gradient(135deg, #f09433, #bc1888);
          display: flex; align-items: center; justify-content: center;
          font-size: 40px; color: #fff; font-weight: 700;
        }

        /* Info */
        .profile-info { flex: 1; min-width: 0; }
        .profile-username-row {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 18px; flex-wrap: wrap;
        }
        .profile-username {
          font-size: 26px; font-weight: 300; color: #1a1a1a;
          letter-spacing: -0.3px;
        }
        .profile-lock { font-size: 16px; }
        .profile-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .profile-btn-secondary {
          padding: 8px 18px; border-radius: 10px;
          font-weight: 600; font-size: 13px; font-family: inherit;
          border: 1.5px solid #DBDBDB; background: #fff; color: #1a1a1a;
          cursor: pointer; transition: background 0.15s;
        }
        .profile-btn-secondary:hover { background: #F5F5F5; }

        /* Stats */
        .profile-stats {
          display: flex; gap: 32px; margin-bottom: 18px;
        }
        .profile-stat { text-align: left; }
        .profile-stat-num { font-size: 17px; font-weight: 700; color: #1a1a1a; }
        .profile-stat-label { font-size: 14px; color: #555; }

        /* Bio */
        .profile-bio { font-size: 14px; color: #1a1a1a; line-height: 1.6; }
        .profile-fullname { font-weight: 700; margin-bottom: 2px; font-size: 14px; color: #1a1a1a; }
        .profile-website { color: #00376b; font-weight: 600; font-size: 13px; text-decoration: none; }
        .profile-website:hover { text-decoration: underline; }

        /* Divider */
        .profile-divider { height: 1px; background: #F0F0F0; margin-bottom: 0; }

        /* Post tabs */
        .profile-tabs {
          display: flex; border-bottom: 1px solid #F0F0F0;
          margin-bottom: 24px;
        }
        .profile-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 13px 24px; font-size: 12px; font-weight: 700;
          letter-spacing: 0.8px; text-transform: uppercase;
          color: #aaa; border: none; background: none;
          cursor: pointer; border-bottom: 2px solid transparent;
          margin-bottom: -1px; font-family: inherit;
          transition: color 0.15s, border-color 0.15s;
        }
        .profile-tab.active { color: #1a1a1a; border-bottom-color: #1a1a1a; }
        .profile-tab:hover:not(.active) { color: #555; }

        /* Posts grid */
        .profile-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px;
        }
        .profile-grid-item {
          position: relative; width: 100%; padding-bottom: 100%; overflow: hidden;
          background: #F5F5F5; cursor: pointer;
        }
        .profile-grid-item img,
        .profile-grid-item video {
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.3s;
        }
        .profile-grid-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          gap: 20px; opacity: 0; transition: opacity 0.2s;
        }
        .profile-grid-item:hover .profile-grid-overlay { opacity: 1; }
        .profile-grid-item:hover img,
        .profile-grid-item:hover video { transform: scale(1.04); }
        .profile-overlay-stat {
          display: flex; align-items: center; gap: 6px;
          color: #fff; font-weight: 700; font-size: 16px;
        }

        /* Private state */
        .profile-private {
          text-align: center; padding: 60px 20px;
          border-top: 1px solid #F0F0F0;
        }
        .profile-private-icon {
          width: 68px; height: 68px; border-radius: 50%;
          border: 2px solid #1a1a1a;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; font-size: 28px;
        }
        .profile-private h3 { font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px; }
        .profile-private p { color: #888; font-size: 14px; margin: 0; }

        /* Empty posts */
        .profile-empty {
          grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #aaa;
        }

        @media (max-width: 640px) {
          .profile-header { gap: 20px; }
          .profile-avatar-wrap { width: 80px; height: 80px; }
          .profile-username { font-size: 18px; }
          .profile-stats { gap: 18px; }
          .profile-page { padding: 20px 16px 80px; }
        }
      `}</style>

      <div className="profile-page">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-inner">
              {profile.profilePicture
                ? <img src={profile.profilePicture} alt="" className="profile-avatar-img" />
                : <div className="profile-avatar-default">{profile.username?.[0]?.toUpperCase()}</div>
              }
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-username-row">
              <h2 className="profile-username">
                {profile.username}
                {profile.isPrivate && <span className="profile-lock" style={{ marginLeft: 8 }}>🔒</span>}
              </h2>
              {isOwnProfile ? (
                <div className="profile-actions">
                  <Link to="/accounts/edit">
                    <button className="profile-btn-secondary">Edit Profile</button>
                  </Link>
                </div>
              ) : (
                <div className="profile-actions">
                  <button onClick={handleFollow} disabled={followLoading} style={followBtnStyle}>
                    {followBtnText}
                  </button>
                  <button onClick={handleMessage} className="profile-btn-secondary">Message</button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-num">{isPrivateAndLocked ? profile.postsCount : posts.length}</div>
                <div className="profile-stat-label">posts</div>
              </div>
              <div className="profile-stat" style={{ cursor: profile.canViewLists ? 'pointer' : 'default' }} onClick={() => profile.canViewLists && setShowFollowers(true)}>
                <div className="profile-stat-num">
                  {isPrivateAndLocked ? profile.followersCount || 0 : (profile.canViewLists ? profile.followers?.length : profile.followersCount) || 0}
                </div>
                <div className="profile-stat-label">followers</div>
              </div>
              <div className="profile-stat" style={{ cursor: profile.canViewLists ? 'pointer' : 'default' }} onClick={() => profile.canViewLists && setShowFollowing(true)}>
                <div className="profile-stat-num">
                  {isPrivateAndLocked ? profile.followingCount || 0 : (profile.canViewLists ? profile.following?.length : profile.followingCount) || 0}
                </div>
                <div className="profile-stat-label">following</div>
              </div>
            </div>

            {/* Bio */}
            {!isPrivateAndLocked && (
              <div className="profile-bio">
                {profile.fullName && <div className="profile-fullname">{profile.fullName}</div>}
                {profile.bio && <div style={{ marginBottom: 4 }}>{profile.bio}</div>}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="profile-website">
                    {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="profile-divider" />

        {/* Private account wall */}
        {(isAccountPrivate || isPrivateAndLocked) ? (
          <div className="profile-private">
            <div className="profile-private-icon">🔒</div>
            <h3>This account is private</h3>
            <p>Follow this account to see their photos and videos.</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="profile-tabs">
              <button className={`profile-tab${activeTab === 'posts' ? ' active' : ''}`} onClick={() => setActiveTab('posts')}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                Posts
              </button>
              <button className={`profile-tab${activeTab === 'reels' ? ' active' : ''}`} onClick={() => setActiveTab('reels')}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.5"/><path d="M10 8l6 4-6 4z"/></svg>
                Reels
              </button>
            </div>

            {/* Posts grid */}
            <div className="profile-grid">
              {posts.filter(p => activeTab === 'posts' ? p.type === 'post' : p.type === 'reel').length === 0 ? (
                <div className="profile-empty">
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{activeTab === 'posts' ? '📷' : '🎬'}</div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#555', marginBottom: 4 }}>No {activeTab} yet</p>
                  {isOwnProfile && <p style={{ fontSize: 13 }}>Share your first {activeTab === 'posts' ? 'photo' : 'reel'}.</p>}
                </div>
              ) : posts.filter(p => activeTab === 'posts' ? p.type === 'post' : p.type === 'reel').map(post => (
                <div
                  key={post._id}
                  className="profile-grid-item"
                  onMouseEnter={() => setHoveredPost(post._id)}
                  onMouseLeave={() => setHoveredPost(null)}
                  onClick={() => setSelectedPost(post)}
                >
                  {post.type === 'post' && !post.mediaUrl.includes('/video/')
                    ? <img src={post.mediaUrl} alt="" />
                    : <video src={post.mediaUrl} muted />
                  }
                  <div className="profile-grid-overlay">
                    <div className="profile-overlay-stat">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      {post.likesCount || post.likes?.length || 0}
                    </div>
                    <div className="profile-overlay-stat">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      {post.commentsCount || post.comments?.length || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showFollowers && profile.canViewLists && renderListModal('Followers', profile.followers || [], () => setShowFollowers(false))}
      {showFollowing && profile.canViewLists && renderListModal('Following', profile.following || [], () => setShowFollowing(false))}
      
      {selectedPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedPost(null)}>
          <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '40px', cursor: 'pointer' }} onClick={() => setSelectedPost(null)}>&times;</button>
          <div style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: '12px' }} onClick={e => e.stopPropagation()}>
            <Post 
              post={selectedPost} 
              onDelete={(id) => {
                setPosts(p => p.filter(x => x._id !== id));
                setSelectedPost(null);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
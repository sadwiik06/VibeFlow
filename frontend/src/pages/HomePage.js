import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../apiConfig';
import Feed from '../components/Feed';

/* ─── Suggestions Sidebar ─── */
const SuggestionsSidebar = ({ user, profile, suggestions }) => {
  return (
    <aside style={{ width: '300px', flexShrink: 0 }}>
      {/* Profile card */}
      <div style={{
        background: '#fff',
        border: '1px solid #E4E4E2',
        borderRadius: '16px',
        padding: '18px',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            border: '2px solid #E4E4E2',
            overflow: 'hidden', background: '#F2F2F0',
          }}>
            <img
              src={user?.profilePicture || '/default-avatar.png'}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link
              to={`/profile/${user?.username}`}
              style={{ fontSize: '14px', fontWeight: '700', color: '#0A0A0A', display: 'block', letterSpacing: '-0.01em', textDecoration: 'none' }}
            >
              {user?.username}
            </Link>
            <span style={{ fontSize: '12px', color: '#9A9A9A' }}>{user?.fullName || 'Your profile'}</span>
          </div>
          <button style={{
            background: 'none', border: '1px solid #E4E4E2', borderRadius: '8px',
            color: '#6C63FF', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            padding: '5px 10px', fontFamily: 'inherit',
            transition: 'all 0.15s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EEEEFF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >
            Switch
          </button>
        </div>
        {/* Mini stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            ['Posts', profile?.postsCount || 0],
            ['Followers', profile?.followers ? profile.followers.length : 0],
            ['Following', profile?.following ? profile.following.length : 0]
          ].map(([label, val]) => (
            <div key={label} style={{ textAlign: 'center', padding: '10px 6px', background: '#F7F7F5', borderRadius: '10px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0A0A0A', letterSpacing: '-0.02em' }}>{val}</div>
              <div style={{ fontSize: '11px', color: '#9A9A9A', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions bento card */}
      <div style={{
        background: '#fff',
        border: '1px solid #E4E4E2',
        borderRadius: '16px',
        padding: '16px 18px',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#0A0A0A', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Suggested
          </span>
          <button style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: '600', color: '#6C63FF', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
            See all
          </button>
        </div>

        {suggestions.length > 0 ? suggestions.map((u, i) => (
          <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i < suggestions.length - 1 ? '12px' : '0' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: ['#EEE0FF', '#E0F2FF', '#FFEEE0', '#E0FFE8', '#FFE0EE'][i % 5],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '700',
              color: ['#7C3AED', '#2563EB', '#EA580C', '#16A34A', '#DB2777'][i % 5],
              overflow: 'hidden'
            }}>
              {u.profilePicture && !u.profilePicture.includes('default') ? (
                <img src={u.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                u.username[0].toUpperCase()
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link to={`/profile/${u.username}`} style={{ textDecoration: 'none' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</div>
              </Link>
              <div style={{ fontSize: '11px', color: '#9A9A9A' }}>Suggested for you</div>
            </div>
            <button style={{
              background: 'none', border: '1px solid #E4E4E2', borderRadius: '8px',
              color: '#6C63FF', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              padding: '4px 10px', fontFamily: 'inherit',
              transition: 'all 0.15s ease', flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EEEEFF'; e.currentTarget.style.borderColor = '#6C63FF'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#E4E4E2'; }}
            >
              Follow
            </button>
          </div>
        )) : <div style={{ fontSize: '13px', color: '#9A9A9A' }}>No suggestions available</div>}
      </div>

      {/* Footer */}
      <div style={{ padding: '4px 4px', fontSize: '11px', color: '#C0C0BE', lineHeight: 2 }}>
        {['About', 'Help', 'Press', 'API', 'Privacy', 'Terms'].join(' · ')}
        <div style={{ marginTop: '4px', letterSpacing: '0.05em' }}>© 2025 VibeFlow</div>
      </div>
    </aside>
  );
};

/* ─── HomePage ─── */
const HomePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !user) return;

        // Fetch full profile info for stats
        const profileRes = await axios.get(`${API_BASE_URL}/api/users/${user.username}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(profileRes.data);

        // Fetch suggested users
        const sugRes = await axios.get(`${API_BASE_URL}/api/users/suggestions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuggestions(sugRes.data);
      } catch (err) {
        console.error('Failed to fetch sidebar data', err);
      }
    };
    fetchSidebarData();
  }, [user]);

  return (
    <>
      <style>{`
        .lp-home {
          background: #F7F7F5;
          min-height: calc(100vh - 60px);
        }
        .lp-home-inner {
          max-width: 980px;
          margin: 0 auto;
          padding: 28px 20px 80px;
          display: flex;
          gap: 24px;
          align-items: flex-start;
          justify-content: center;
        }
        .lp-feed-col {
          flex: 1;
          min-width: 0;
          max-width: 500px;
        }
        .lp-sidebar-col { display: block; }
        @media (max-width: 920px) { .lp-sidebar-col { display: none; } }
        @media (max-width: 540px) {
          .lp-home-inner { padding: 0 0 80px; gap: 0; }
        }
      `}</style>
      <div className="lp-home">
        <div className="lp-home-inner">
          <div className="lp-feed-col"><Feed /></div>
          <div className="lp-sidebar-col"><SuggestionsSidebar user={user} profile={profile} suggestions={suggestions} /></div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
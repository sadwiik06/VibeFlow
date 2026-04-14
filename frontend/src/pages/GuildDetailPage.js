import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import GuildChat from '../components/GuildChat';
import GuildMembers from '../components/GuildMembers';
import GuildSettings from '../components/GuildSettings';

const NavIcon = {
  chat: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  members: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
};

const GuildDetailPage = () => {
  const { guildId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useChat();
  const [guild, setGuild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [copied, setCopied] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchGuild();
    if (socket) socket.emit('join guild', guildId);
    return () => { if (socket) socket.emit('leave guild', guildId); };
  }, [guildId, socket]);

  const fetchGuild = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/guilds/${guildId}`, { headers: { Authorization: `Bearer ${token}` } });
      setGuild(res.data);
    } catch { setError('Guild not found or access denied.'); }
    finally { setLoading(false); }
  };

  const isMember = guild?.members?.some(m => (m._id || m).toString() === user?._id?.toString());
  const isOwner = guild?.owner?._id?.toString() === user?._id?.toString();
  const isAdmin = guild?.memberRoles?.find(m => m.user?.toString() === user?._id?.toString())?.role === 'admin';
  const canManage = isOwner || isAdmin;

  // Auto-redirect if permissions are lost while on settings tab
  useEffect(() => {
    if (activeTab === 'settings' && !canManage && !loading) {
      setActiveTab('chat');
    }
  }, [canManage, activeTab, loading]);

  const handleJoin = async () => {
    try {
      await axios.post(`http://localhost:5000/api/guilds/${guildId}/join`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchGuild();
    } catch (err) { alert(err.response?.data?.message || 'Failed to join'); }
  };

  const handleLeave = async () => {
    if (!window.confirm('Leave this guild?')) return;
    try {
      await axios.post(`http://localhost:5000/api/guilds/${guildId}/leave`, {}, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/guilds');
    } catch (err) { alert(err.response?.data?.message || 'Failed to leave'); }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/guilds/join/${guild.inviteToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'chat', label: 'Chat' },
    { id: 'members', label: 'Members' },
    ...(canManage ? [{ id: 'settings', label: 'Settings' }] : []),
  ];

  if (loading) return (
    <div style={{ height: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F7F5' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2.5px solid #E4E4E2', borderTopColor: '#6C63FF', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ height: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F7F5', flexDirection: 'column', gap: '12px', textAlign: 'center', padding: '24px' }}>
      <div style={{ fontSize: '40px' }}>😕</div>
      <div style={{ fontWeight: '700', color: '#0A0A0A', letterSpacing: '-0.01em' }}>{error}</div>
      <button onClick={() => navigate('/guilds')} style={{ padding: '9px 20px', background: '#0A0A0A', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Back to Guilds</button>
    </div>
  );

  if (!guild) return null;

  return (
    <>
      <style>{`
        .gd-layout { display: flex; height: calc(100vh - 60px); background: #F7F7F5; }
        .gd-sidebar {
          width: 248px; flex-shrink: 0;
          background: #fff; border-right: 1px solid #E4E4E2;
          display: flex; flex-direction: column; overflow: hidden;
        }
        .gd-cover {
          height: 100px; flex-shrink: 0; overflow: hidden; position: relative;
          display: flex; align-items: center; justify-content: center;
          background: #EEE0FF;
        }
        .gd-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .gd-cover-icon { width: 40px; height: 40px; background: rgba(255,255,255,0.5); border-radius: '10px'; display: flex; align-items: center; justify-content: center; font-size: 20px; border-radius: 10px; }
        .gd-info { padding: 16px; border-bottom: 1px solid #F2F2F0; flex-shrink: 0; }
        .gd-meta { display: flex; gap: '8px'; flex-wrap: wrap; margin-top: 10px; }
        .gd-nav { padding: 10px 8px; flex: 1; overflow-y: auto; }
        .gd-nav-btn {
          display: flex; align-items: center; gap: 9px;
          width: 100%; padding: 9px 11px; border-radius: '10px'; border: none;
          background: none; font-size: 13px; font-weight: 500; color: #9A9A9A;
          cursor: pointer; font-family: inherit; transition: all 0.12s; text-align: left;
          border-radius: 10px;
        }
        .gd-nav-btn:hover { background: #F7F7F5; color: #0A0A0A; }
        .gd-nav-btn.on { background: #EEEEFF; color: #6C63FF; font-weight: 700; }
        .gd-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #fff; }
        .gd-main-header { padding: 0 20px; height: 50px; border-bottom: 1px solid #E4E4E2; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .gd-invite { margin: 12px; background: #F7F7F5; border: 1px solid #E4E4E2; border-radius: 12px; padding: 12px; flex-shrink: 0; }
        .gd-locked { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; padding: 40px; }
        @media(max-width:700px) { .gd-sidebar { width: 200px; } }
        @media(max-width:520px) { .gd-sidebar { display: none; } }
      `}</style>

      <div className="gd-layout">
        <div className="gd-sidebar">
          <div className="gd-cover">
            {guild.coverImage ? <img src={guild.coverImage} alt="" /> : <div className="gd-cover-icon">🛡️</div>}
          </div>

          <div className="gd-info">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0A0A0A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{guild.name}</div>
              <div style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: '700', background: guild.type === 'public' ? '#D1FAE5' : '#FEE2E2', color: guild.type === 'public' ? '#065F46' : '#991B1B', flexShrink: 0 }}>
                {guild.type.toUpperCase()}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#9A9A9A', lineHeight: '1.5', marginTop: '6px' }}>{guild.description}</div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: '#F2F2F0', borderRadius: '99px', fontSize: '11px', color: '#5A5A5A' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                {guild.memberCount || guild.members?.length}
              </div>
              {guild.topic && <div style={{ padding: '3px 8px', background: '#EEEEFF', color: '#3730A3', borderRadius: '99px', fontSize: '11px', fontWeight: '500' }}>{guild.topic}</div>}
            </div>

            <div style={{ fontSize: '12px', color: '#9A9A9A', marginTop: '8px' }}>
              by <span style={{ color: '#0A0A0A', fontWeight: '600' }}>{guild.owner?.username}</span>
            </div>

            {!isMember && (
              <button onClick={handleJoin} style={{ width: '100%', marginTop: '12px', padding: '9px', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {guild.type === 'private' ? '🔒 Request to Join' : '+ Join Guild'}
              </button>
            )}
            {isMember && !isOwner && (
              <button onClick={handleLeave} style={{ width: '100%', marginTop: '12px', padding: '9px', background: '#fff', color: '#DC2626', border: '1px solid #FEE2E2', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
              >
                Leave Guild
              </button>
            )}
          </div>

          {canManage && guild.inviteToken && (
            <div className="gd-invite">
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#9A9A9A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Invite Link</div>
              <input
                readOnly
                value={`${window.location.origin}/guilds/join/${guild.inviteToken}`}
                onClick={e => e.target.select()}
                style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px', border: '1px solid #E4E4E2', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#5A5A5A', background: '#fff', outline: 'none', cursor: 'pointer' }}
              />
              <button onClick={copyInvite} style={{ width: '100%', marginTop: '7px', padding: '7px', border: `1px solid ${copied ? '#D1FAE5' : '#E4E4E2'}`, background: copied ? '#D1FAE5' : '#fff', color: copied ? '#065F46' : '#6C63FF', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          )}

          <nav className="gd-nav">
            {tabs.map(t => (
              <button key={t.id} className={`gd-nav-btn ${activeTab === t.id ? 'on' : ''}`} onClick={() => setActiveTab(t.id)}>
                {NavIcon[t.id]}
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="gd-main">
          <div className="gd-main-header">
            <span style={{ color: activeTab === 'chat' ? '#6C63FF' : '#9A9A9A' }}>{NavIcon[activeTab]}</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0A0A0A', letterSpacing: '-0.01em' }}>{tabs.find(t => t.id === activeTab)?.label}</span>
            <span style={{ fontSize: '13px', color: '#C0C0BE' }}>— {guild.name}</span>
          </div>

          {!isMember && guild.type === 'private' ? (
            <div className="gd-locked">
              <div style={{ width: 60, height: 60, background: '#FEF3C7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🔒</div>
              <div style={{ fontWeight: '800', fontSize: '17px', color: '#0A0A0A', letterSpacing: '-0.02em' }}>Private guild</div>
              <div style={{ fontSize: '13px', color: '#9A9A9A', maxWidth: '280px', lineHeight: '1.6' }}>Request to join or ask a member for an invite link to access this community.</div>
              <button onClick={handleJoin} style={{ padding: '10px 24px', background: '#0A0A0A', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Request to Join</button>
            </div>
          ) : isMember ? (
            <>
              {activeTab === 'chat' && <GuildChat guildId={guildId} />}
              {activeTab === 'members' && <GuildMembers guild={guild} onRefresh={fetchGuild} canManage={canManage} />}
              {activeTab === 'settings' && canManage && <GuildSettings guild={guild} onUpdate={fetchGuild} />}
            </>
          ) : (
            <div className="gd-locked">
              <div style={{ fontWeight: '700', color: '#9A9A9A' }}>Join to see content</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GuildDetailPage;
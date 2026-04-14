import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── SVG Icons ── */
const HomeIcon = ({ a }) => a
  ? <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M21 20a1 1 0 0 1-1 1h-5v-5h-6v5H4a1 1 0 0 1-1-1V10.5a1 1 0 0 1 .31-.71l8-7.5a1 1 0 0 1 1.38 0l8 7.5a1 1 0 0 1 .31.71z" /></svg>
  : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" /><polyline points="9 21 9 13 15 13 15 21" /></svg>;

const ExploreIcon = () =>
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;

const ReelIcon = ({ a }) => a
  ? <svg viewBox="0 0 24 24" width="20" height="20"><rect fill="currentColor" x="2" y="2" width="20" height="20" rx="4" /><path fill="white" d="M10 8l6 4-6 4z" /></svg>
  : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="4" /><path d="M10 8l6 4-6 4z" /></svg>;

const ChatIcon = ({ a }) => a
  ? <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M20 2H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h3l3 4 3-4h7a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" /></svg>
  : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;

const GuildIcon = ({ a }) => a
  ? <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.4C16.5 22.15 20 17.25 20 12V6z" /></svg>
  : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V6l-8-3-8 3v6c0 6 8 10 8 10z" /></svg>;

const HeartIcon = ({ a }) => a
  ? <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
  : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;

const AddIcon = () =>
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="4" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;

const ProfileIcon = ({ a }) => a
  ? <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" /></svg>
  : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;

const SettingsIcon = () =>
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;

const LogoutIcon = () =>
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;

/* ── Sidebar ── */
const Sidebar = ({ onOpenCreate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: (a) => <HomeIcon a={a} /> },
    { path: '/explore', label: 'Search', icon: () => <ExploreIcon /> },
    { path: '/reels', label: 'Reels', icon: (a) => <ReelIcon a={a} /> },
    { path: '/chat', label: 'Messages', icon: (a) => <ChatIcon a={a} /> },
    { path: '/guilds', label: 'Guilds', icon: (a) => <GuildIcon a={a} /> },
    { path: '/follow-requests', label: 'Requests', icon: (a) => <HeartIcon a={a} /> },
    { path: '/create', label: 'Create', icon: () => <AddIcon /> },
  ];

  const bottomItems = [
    { path: `/profile/${user?.username}`, label: 'Profile', icon: (a) => <ProfileIcon a={a} /> },
    { path: '/settings', label: 'Settings', icon: () => <SettingsIcon /> },
  ];

  const w = collapsed ? '72px' : '230px';

  return (
    <>
      <style>{`
        :root {
          --sidebar-bg: #ffffff;
          --item-radius: 14px;
          --item-hover: #F7F7F7;
          --item-active-bg: #F0F0F0;
          --text-main: #1a1a1a;
          --text-muted: #8e8e8e;
          --border-col: #F0F0F0;
          --transition: 0.22s cubic-bezier(.4,0,.2,1);
        }

        .VibeFlow-sidebar {
          position: sticky; top: 0;
          height: 100vh;
          width: ${w};
          min-width: ${w};
          background: var(--sidebar-bg);
          border-right: 1px solid var(--border-col);
          display: flex; flex-direction: column;
          padding: 18px 10px 14px;
          transition: width var(--transition), min-width var(--transition);
          overflow: hidden;
          z-index: 100;
        }

        /* Logo */
        .sb-logo {
          display: flex; align-items: center;
          gap: 10px;
          padding: 6px 10px 18px;
          text-decoration: none;
          overflow: hidden;
          cursor: pointer;
          border-radius: var(--item-radius);
          transition: background var(--transition);
        }
        .sb-logo:hover { background: var(--item-hover); }
        .sb-logo-icon {
          width: 30px; height: 30px; flex-shrink: 0;
          border-radius: 8px;
          background: #0A0A0A;
          display: flex; align-items: center; justify-content: center;
        }
        .sb-logo-icon svg { display: block; }
        .sb-logo-text {
          font-size: 19px; font-weight: 800;
          color: #0A0A0A;
          white-space: nowrap;
          letter-spacing: -0.5px;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity var(--transition);
        }

        /* Nav */
        .sb-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; overflow: hidden; }

        .sb-item {
          display: flex; align-items: center;
          gap: 13px;
          padding: 11px 12px;
          border-radius: var(--item-radius);
          cursor: pointer; color: var(--text-main);
          text-decoration: none;
          transition: background var(--transition), transform 0.1s;
          white-space: nowrap;
          overflow: hidden;
          position: relative;
          border: none; background: none;
          width: 100%; text-align: left;
          font-family: inherit;
        }
        .sb-item:hover { background: var(--item-hover); transform: translateX(2px); }
        .sb-item:active { transform: scale(0.97); }
        .sb-item.active { background: var(--item-active-bg); }
        .sb-item.active .sb-item-icon { color: #1a1a1a; }

        .sb-item-icon {
          width: 22px; height: 22px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: var(--text-main);
          transition: color var(--transition);
        }
        .sb-item-label {
          font-size: 14px; font-weight: 500; color: var(--text-main);
          opacity: ${collapsed ? 0 : 1};
          transition: opacity var(--transition);
          flex: 1;
        }
        .sb-item.active .sb-item-label { font-weight: 700; }

        /* Notif badge */
        .sb-badge {
          width: 18px; height: 18px; border-radius: 50%;
          background: #fe3b30;
          color: #fff; font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity var(--transition);
        }

        /* Create special style */
        .sb-item.create-item .sb-item-icon {
          width: 34px; height: 34px;
          border-radius: 10px;
          border: 1.5px solid #E0E0E0;
          background: #fff;
          margin: -6px 0;
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        .sb-item.create-item:hover .sb-item-icon {
          border-color: #262626;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .sb-divider { height: 1px; background: var(--border-col); margin: 6px 8px; flex-shrink: 0; }

        /* Footer */
        .sb-footer { padding-top: 8px; }
        .sb-user {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: var(--item-radius);
          cursor: pointer; transition: background var(--transition);
          overflow: hidden;
        }
        .sb-user:hover { background: var(--item-hover); }
        .sb-avatar-wrap {
          width: 34px; height: 34px; border-radius: 50%;
          padding: 1.5px; flex-shrink: 0;
          background: #0A0A0A;
        }
        .sb-avatar-inner { background: #fff; border-radius: 50%; padding: 1.5px; width: 100%; height: 100%; }
        .sb-avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
        .sb-user-meta {
          flex: 1; min-width: 0;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity var(--transition);
        }
        .sb-username { font-size: 13px; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sb-usersub { font-size: 11px; color: var(--text-muted); }
        .sb-logout {
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); padding: 6px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          transition: color var(--transition), background var(--transition);
          flex-shrink: 0;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity var(--transition), color var(--transition), background var(--transition);
        }
        .sb-logout:hover { color: var(--text-main); background: #EFEFEF; }

        /* Collapse toggle */
        .sb-collapse-btn {
          width: 100%; display: flex; align-items: center; justify-content: ${collapsed ? 'center' : 'flex-start'};
          gap: 13px; padding: 10px 12px;
          border-radius: var(--item-radius);
          border: none; background: none; cursor: pointer;
          color: var(--text-muted); font-family: inherit; font-size: 13px;
          transition: background var(--transition), color var(--transition);
          overflow: hidden; white-space: nowrap;
        }
        .sb-collapse-btn:hover { background: var(--item-hover); color: var(--text-main); }
        .sb-collapse-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform 0.3s; transform: ${collapsed ? 'rotate(180deg)' : 'none'}; }

        /* Mobile bottom nav */
        .sb-mobile {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(14px);
          border-top: 1px solid var(--border-col);
          padding: 8px 0 env(safe-area-inset-bottom);
        }
        .sb-mobile-inner { display: flex; align-items: center; justify-content: space-around; max-width: 500px; margin: 0 auto; }
        .sb-mobile-btn {
          background: none; border: none; cursor: pointer;
          color: var(--text-main); padding: 8px 12px;
          display: flex; flex-direction: column; align-items: center;
          border-radius: 10px; transition: background 0.15s, transform 0.1s;
          gap: 3px;
        }
        .sb-mobile-btn:active { transform: scale(0.88); background: var(--item-hover); }
        .sb-mobile-label { font-size: 10px; color: var(--text-muted); font-weight: 500; }

        @media (max-width: 1100px) {
          .VibeFlow-sidebar { width: 72px !important; min-width: 72px !important; }
          .sb-item-label, .sb-logo-text, .sb-user-meta, .sb-logout, .sb-badge { opacity: 0 !important; pointer-events: none; }
          .sb-item { justify-content: center; }
          .sb-user { justify-content: center; }
          .sb-collapse-btn { display: none; }
        }
        @media (max-width: 768px) {
          .VibeFlow-sidebar { display: none; }
          .sb-mobile { display: block; }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="VibeFlow-sidebar">
        {/* Logo */}
        <div className="sb-logo" onClick={() => navigate('/')}>
          <div className="sb-logo-icon">
            <svg viewBox="0 0 14 14" width="16" height="16" fill="none">
              <path d="M7 1L12.5 4.5V10.5L7 14L1.5 10.5V4.5L7 1Z" fill="white" />
            </svg>
          </div>
          <span className="sb-logo-text">VibeFlow</span>
        </div>

        {/* Main Nav */}
        <nav className="sb-nav">
          {navItems.map(item => (
            item.path === '/create' ? (
              <button
                key={item.path}
                className="sb-item create-item"
                onClick={onOpenCreate}
              >
                <span className="sb-item-icon">{item.icon(false)}</span>
                <span className="sb-item-label">{item.label}</span>
              </button>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `sb-item${isActive ? ' active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <span className="sb-item-icon">{item.icon(isActive)}</span>
                    <span className="sb-item-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.label}
                      {item.label === 'Guilds' && <span style={{ background: '#0A0A0A', color: '#fff', fontSize: '9px', fontWeight: '800', padding: '2px 5px', borderRadius: '4px', letterSpacing: '0.5px' }}>NEW</span>}
                    </span>
                    {item.path === '/notifications' && <span className="sb-badge">3</span>}
                  </>
                )}
              </NavLink>
            )
          ))}

          <div className="sb-divider" />

          {bottomItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sb-item${isActive ? ' active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <span className="sb-item-icon">{item.icon(isActive)}</span>
                  <span className="sb-item-label">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button className="sb-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          <span className="sb-collapse-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </span>
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* User Footer */}
        <div className="sb-footer">
          <div className="sb-user" onClick={() => navigate(`/profile/${user?.username}`)}>
            <div className="sb-avatar-wrap">
              <div className="sb-avatar-inner">
                <img src={user?.profilePicture || '/default-avatar.png'} alt="" className="sb-avatar-img" />
              </div>
            </div>
            <div className="sb-user-meta">
              <div className="sb-username">{user?.username}</div>
              <div className="sb-usersub">View profile</div>
            </div>
            <button
              className="sb-logout"
              title="Log out"
              onClick={e => { e.stopPropagation(); logout(); navigate('/login'); }}
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="sb-mobile">
        <div className="sb-mobile-inner">
          {[
            { to: '/', label: 'Home', icon: <HomeIcon a={false} /> },
            { to: '/explore', label: 'Search', icon: <ExploreIcon /> },
            { to: '/create', label: 'Create', icon: <AddIcon />, action: onOpenCreate },
            { to: '/reels', label: 'Reels', icon: <ReelIcon a={false} /> },
            { to: `/profile/${user?.username}`, label: 'Profile', icon: <ProfileIcon a={false} /> },
          ].map((item, i) => (
            <button key={i} className="sb-mobile-btn" onClick={() => item.action ? item.action() : navigate(item.to)}>
              {item.icon}
              <span className="sb-mobile-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
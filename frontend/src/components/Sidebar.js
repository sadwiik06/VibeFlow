import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/reels', label: 'Reels', icon: '🎬' },
        { path: '/chat', label: 'Messages', icon: '💬' },
        { path: '/guilds', label: 'Guilds', icon: '🛡️' },
        { path: `/profile/${user?.username}`, label: 'Profile', icon: '👤' }
    ];

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <h2 className="logo">VibeFlow</h2>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">
                {user && (
                    <div className="user-info">
                        <img
                            src={user.profilePicture || '/default-avatar.png'}
                            alt="Profile"
                            className="user-avatar"
                            style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                        />
                        <div className="user-details">
                            <span className="username">{user.username}</span>
                        </div>
                    </div>
                )}
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
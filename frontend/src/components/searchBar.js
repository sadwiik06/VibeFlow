import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            if (query.trim().length === 0) {
                setResults([]);
                return;
            }
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/api/users/search?q=${query}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setResults(res.data);
            } catch (err) {
                console.error('Search error', err);
            }
        };
        const debounce = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    return (
        <div ref={searchRef} style={{ position: 'relative' }}>
            <input
                type="text"
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                style={{ padding: '8px', width: '250px' }}
            />
            {showResults && results.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1000,
                }}>
                    {results.map(user => (
                        <Link
                            key={user._id}
                            to={`/profile/${user.username}`}
                            onClick={() => {
                                setQuery('');
                                setShowResults(false);
                            }}
                            style={{ display: 'flex', alignItems: 'center', padding: '10px', textDecoration: 'none', color: 'black' }}
                        >
                            <img
                                src={user.profilePicture || '/default-avatar.png'}
                                alt=""
                                style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                            />
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>{user.fullName}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
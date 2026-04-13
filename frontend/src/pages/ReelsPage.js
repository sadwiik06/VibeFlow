import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import ReelItem from '../components/ReelItem';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useSearchParams } from 'react-router-dom';

const ReelsPage = () => {
    const [reels, setReels] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState('');
    const [currentReelIndex, setCurrentReelIndex] = useState(0);
    const currentReelIndexRef = useRef(0);
    
    // Watch Together states
    const [watchSessionId, setWatchSessionId] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [watchGuest, setWatchGuest] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);

    const observer = useRef();
    const { user } = useAuth();
    const { socket } = useChat();
    const [searchParams] = useSearchParams();
    const token = localStorage.getItem('token');

    // Join session from URL
    useEffect(() => {
        const sessionFromUrl = searchParams.get('watch');
        if (sessionFromUrl && socket && !watchSessionId) {
            joinWatchSession(sessionFromUrl);
        }
    }, [searchParams, socket]);

    // Socket Listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('watch guest joined', ({ guest }) => {
            setWatchGuest(guest);
            alert(`${guest.username} joined your watch session`);
        });

        socket.on('watch guest left', () => {
            setWatchGuest(null);
            alert('Guest left the session');
        });

        socket.on('watch session ended', () => {
            setWatchSessionId(null);
            setIsHost(false);
            setWatchGuest(null);
            alert('Watch session ended by host');
        });

        socket.on('watch sync', ({ action, payload }) => {
            if (action === 'next' || action === 'prev' || action === 'index') {
                setCurrentReelIndex(payload.index);
                currentReelIndexRef.current = payload.index;
                // Scroll to the index
                const container = document.querySelector('.reels-container');
                const items = container.querySelectorAll('.reel-item-wrapper');
                if (items[payload.index]) {
                    items[payload.index].scrollIntoView({ behavior: 'smooth' });
                }
            } else if (action === 'play') {
                setIsPlaying(true);
                syncVideo(payload.timestamp, true);
            } else if (action === 'pause') {
                setIsPlaying(false);
                syncVideo(payload.timestamp, false);
            }
        });

        return () => {
            socket.off('watch guest joined');
            socket.off('watch guest left');
            socket.off('watch session ended');
            socket.off('watch sync');
        };
    }, [socket]);

    const syncVideo = (timestamp, shouldPlay) => {
        const activeVideo = document.querySelector('.reel-item-wrapper[data-active="true"] video');
        if (activeVideo) {
            if (Math.abs(activeVideo.currentTime - timestamp) > 0.5) {
                activeVideo.currentTime = timestamp;
            }
            if (shouldPlay) activeVideo.play().catch(() => {});
            else activeVideo.pause();
        }
    };

    const startWatchTogether = () => {
        if (!socket) return;
        socket.emit('create watch session', (response) => {
            if (response.sessionId) {
                setWatchSessionId(response.sessionId);
                setIsHost(true);
                setShowInviteModal(true);
            }
        });
    };

    const joinWatchSession = (sessionId) => {
        socket.emit('join watch session', { sessionId }, (response) => {
            if (response.error) {
                alert(response.error);
            } else {
                setWatchSessionId(sessionId);
                setIsHost(false);
                setCurrentReelIndex(response.currentReelIndex);
                currentReelIndexRef.current = response.currentReelIndex;
                setIsPlaying(response.isPlaying);
            }
        });
    };

    const endWatchSession = () => {
        if (socket && watchSessionId) {
            socket.emit('leave watch session', { sessionId: watchSessionId });
            setWatchSessionId(null);
            setIsHost(false);
            setWatchGuest(null);
        }
    };

    const fetchReels = async (pageNum) => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/api/posts/reels?page=${pageNum}&limit=3`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (pageNum === 1) {
                setReels(res.data.reels);
            } else {
                setReels(prev => [...prev, ...res.data.reels]);
            }
            setHasMore(res.data.page < res.data.pages);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching reels', err);
            setError('Failed to load reels');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReels(1);
    }, []);

    const lastReelElementRef = useCallback(
        node => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage(prevPage => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore]
    );

    useEffect(() => {
        if (page > 1) {
            fetchReels(page);
        }
    }, [page]);

    // Global Scroll Observer for Index Sync
    useEffect(() => {
        const options = { threshold: 0.7 };
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute('data-index'));
                    if (index !== currentReelIndexRef.current) {
                        currentReelIndexRef.current = index;
                        setCurrentReelIndex(index);
                        if (watchSessionId) {
                            socket.emit('watch sync', {
                                sessionId: watchSessionId,
                                action: 'index',
                                payload: { index }
                            });
                        }
                    }
                }
            });
        }, options);

        const items = document.querySelectorAll('.reel-item-wrapper');
        items.forEach(item => scrollObserver.observe(item));

        return () => scrollObserver.disconnect();
    }, [reels.length, watchSessionId]);

    const handleSyncAction = (action, payload) => {
        if (watchSessionId) {
            socket.emit('watch sync', { sessionId: watchSessionId, action, payload });
        }
    };

    if (loading && reels.length === 0) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading reels...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
    }

    return (
        <div style={{ position: 'relative', height: '100vh', backgroundColor: '#000' }}>
            {/* Header / Controls */}
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', gap: '10px', alignItems: 'center' }}>
                {!watchSessionId ? (
                    <button 
                        onClick={startWatchTogether}
                        style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: '#0095f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        📺 Watch Together
                    </button>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '5px 15px', borderRadius: '20px', color: 'white' }}>
                        <span>Session: {watchSessionId} {isHost ? '(Host)' : ''}</span>
                        {watchGuest && <span>• Guest: {watchGuest.username}</span>}
                        <button onClick={endWatchSession} style={{ background: 'none', border: 'none', color: '#ff4d4d', fontWeight: 'bold', cursor: 'pointer' }}>
                            {isHost ? 'End' : 'Leave'}
                        </button>
                    </div>
                )}
            </div>

            {showInviteModal && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '25px', borderRadius: '12px', zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', textAlign: 'center', maxWidth: '300px' }}>
                    <h3 style={{ marginTop: 0 }}>Invite a friend</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Share this link with a mutual follower to watch together:</p>
                    <input 
                        readOnly 
                        value={`${window.location.origin}/reels?watch=${watchSessionId}`}
                        style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <button onClick={() => setShowInviteModal(false)} style={{ width: '100%', padding: '10px', background: '#0095f6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                        Close
                    </button>
                </div>
            )}

            <div className="reels-container" style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}>
                {reels.map((reel, index) => (
                    <div 
                        ref={index === reels.length - 1 ? lastReelElementRef : null} 
                        key={`${reel._id}-${index}`}
                        data-index={index}
                        data-active={index === currentReelIndex}
                        className="reel-item-wrapper"
                        style={{ height: '100vh', scrollSnapAlign: 'start', position: 'relative' }}
                    >
                        <ReelItem 
                            reel={reel} 
                            isActive={index === currentReelIndex}
                            watchSessionId={watchSessionId}
                            onSyncAction={handleSyncAction}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReelsPage;

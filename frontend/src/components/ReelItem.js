import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../apiConfig';
import './ReelItem.css';

const ReelItem = ({ reel, isActive, watchSessionId, onSyncAction }) => {
    const { user } = useAuth();
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchLikes();
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reel._id]);

    // Manage play/pause based on isActive prop
    useEffect(() => {
        if (isActive) {
            const playPromise = videoRef.current?.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => console.log("Autoplay was prevented"));
            }
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    const fetchLikes = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/likes/${reel._id}`);
            setLikesCount(res.data.length);
            if (user) {
                setLiked(res.data.some(like => like.user._id === user._id));
            }
        } catch (err) {
            console.error('Error fetching likes', err);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/comments/post/${reel._id}`);
            setComments(res.data);
        } catch (err) {
            console.error('Error fetching comments', err);
        }
    };

    const handleLike = async () => {
        if (!user) return;
        setLikeLoading(true);
        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/likes/${reel._id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLiked(res.data.liked);
            setLikesCount(prev => res.data.liked ? prev + 1 : prev - 1);
        } catch (err) {
            console.error('Like toggle failed', err);
        } finally {
            setLikeLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || !user) return;
        setLoading(true);
        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/comments/${reel._id}`,
                { text: commentText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComments([res.data, ...comments]);
            setCommentText('');
            setShowComments(true);
        } catch (err) {
            console.error('Add comment failed', err);
        } finally {
            setLoading(false);
        }
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        
        const nextPlaying = videoRef.current.paused;
        if (nextPlaying) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }

        // Sync to guest/host
        if (watchSessionId && onSyncAction) {
            onSyncAction(nextPlaying ? 'play' : 'pause', {
                timestamp: videoRef.current.currentTime
            });
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    return (
        <div className="reel-item">
            <video
                ref={videoRef}
                src={reel.mediaUrl}
                loop
                playsInline
                muted={isMuted}
                onClick={togglePlay}
                className="reel-video ri-video"
            />
            {!isPlaying && (
                <div className="play-overlay" onClick={togglePlay}>
                    ▶
                </div>
            )}

            <div className="reel-overlay">
                <div className="reel-top-right">
                    <button onClick={toggleMute} className="action-btn ri-mute">
                        {isMuted ? (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                        ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                        )}
                    </button>
                </div>

                <div className="reel-info">
                    <Link to={`/profile/${reel.user.username}`} className="user-link">
                        <img 
                            src={reel.user.profilePicture || '/default-avatar.png'} 
                            alt="" 
                            style={{width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover'}}
                        />
                        <span>{reel.user.username}</span>
                    </Link>
                    <p className="caption">{reel.caption}</p>
                </div>

                <div className="reel-side-actions">
                    <button onClick={handleLike} disabled={likeLoading} className="action-btn">
                        {liked ? (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="#fe3b30" stroke="#fe3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        )}
                        <span>{likesCount}</span>
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="action-btn">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        <span>{comments.length}</span>
                    </button>
                </div>
            </div>

            {showComments && (
                <div className="comments-panel">
                    <div className="comments-header">
                        <h3>Comments</h3>
                        <button onClick={() => setShowComments(false)}>✕</button>
                    </div>
                    <div className="comments-list">
                        {comments.map(comment => (
                            <div key={comment._id} className="comment">
                                <strong>{comment.user.username}</strong>
                                <span> {comment.text}</span>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleAddComment} className="comment-form">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button type="submit" disabled={loading}>Post</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ReelItem;
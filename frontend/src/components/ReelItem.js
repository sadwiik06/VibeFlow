import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ReelItem.css';

const ReelItem = ({ reel }) => {
    const { user } = useAuth();
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchLikes();
        fetchComments();
    }, [reel._id]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.6,
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const playPromise = videoRef.current?.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.log("Autoplay was prevented:", error);
                        });
                    }
                    setIsPlaying(true);
                } else {
                    videoRef.current?.pause();
                    setIsPlaying(false);
                }
            });
        }, options);
        if (videoRef.current) observer.observe(videoRef.current);
        return () => {
            observer.disconnect();
        };
    }, []);

    const fetchLikes = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/likes/${reel._id}`);
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
            const res = await axios.get(`http://localhost:5000/api/comments/post/${reel._id}`);
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
                `http://localhost:5000/api/likes/${reel._id}`,
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
                `http://localhost:5000/api/comments/${reel._id}`,
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
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div className="reel-item">
            <video
                ref={videoRef}
                src={reel.mediaUrl}
                loop
                playsInline
                muted
                onClick={togglePlay}
                className="reel-video"
            />
            {!isPlaying && (
                <div className="play-overlay" onClick={togglePlay}>
                    ▶
                </div>
            )}

            <div className="reel-overlay">
                <div className="reel-info">
                    <Link to={`/profile/${reel.user.username}`} className="user-link">
                        <img src={reel.user.profilePicture || '/default-avatar.png'} alt="" />
                        <span>{reel.user.username}</span>
                    </Link>
                    <p className="caption">{reel.caption}</p>
                    {reel.location && <p className="location">📍 {reel.location}</p>}
                </div>

                <div className="reel-side-actions">
                    <button onClick={handleLike} disabled={likeLoading} className="action-btn">
                        {liked ? '❤️' : '🤍'}
                        <span>{likesCount}</span>
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="action-btn">
                        💬
                        <span>{comments.length}</span>
                    </button>
                    <button className="action-btn">📤</button>
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
                                <Link to={`/profile/${comment.user.username}`}>
                                    <strong>{comment.user.username}</strong>
                                </Link>
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
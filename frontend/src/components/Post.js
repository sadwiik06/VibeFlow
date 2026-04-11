import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Post = ({ post }) => {
    const { user } = useAuth();
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [loading, setLoading] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchLikes();
        fetchComments();
    }, [post._id]);

    const fetchLikes = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/likes/${post._id}`);
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
            const res = await axios.get(`http://localhost:5000/api/comments/post/${post._id}`);
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
                `http://localhost:5000/api/likes/${post._id}`,
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
                `http://localhost:5000/api/comments/${post._id}`,
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

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(
                `http://localhost:5000/api/comments/${commentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            console.error('Delete comment failed', err);
        }
    };

    return (
        <div style={{ border: '1px solid #eee', marginBottom: '20px', padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <img
                    src={post.user.profilePicture || '/default-avatar.png'}
                    alt=""
                    style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                />
                <div>
                    <Link to={`/profile/${post.user.username}`} style={{ fontWeight: 'bold', textDecoration: 'none', color: '#000' }}>
                        {post.user.username}
                    </Link>
                    {post.location && (
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                            {post.location}
                        </div>
                    )}
                </div>
            </div>

            {post.type === 'post' ? (
                <img src={post.mediaUrl} alt="" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', borderRadius: '4px' }} />
            ) : (
                <video src={post.mediaUrl} controls style={{ width: '100%', maxHeight: '500px', borderRadius: '4px' }} />
            )}

            <div style={{ marginTop: '10px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button
                    onClick={handleLike}
                    disabled={likeLoading}
                    style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                >
                    {liked ? '❤️' : '🤍'}
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                >
                    💬
                </button>
            </div>

            <p style={{ fontWeight: 'bold', margin: '5px 0' }}>{likesCount} likes</p>

            <p>
                <strong>{post.user.username}</strong> {post.caption}
            </p>

            {comments.length > 0 && (
                <button
                    onClick={() => setShowComments(!showComments)}
                    style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    {showComments ? 'Hide' : 'View'} all {comments.length} comments
                </button>
            )}

            {showComments && (
                <div style={{ marginTop: '10px' }}>
                    {comments.map(comment => (
                        <div key={comment._id} style={{ display: 'flex', marginBottom: '8px', alignItems: 'center' }}>
                            <strong style={{ marginRight: '8px' }}>
                                <Link to={`/profile/${comment.user.username}`}>{comment.user.username}</Link>
                            </strong>
                            <span style={{ flex: 1 }}>{comment.text}</span>
                            {(comment.user._id === user?._id || post.user._id === user?._id) && (
                                <button
                                    onClick={() => handleDeleteComment(comment._id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleAddComment} style={{ display: 'flex', marginTop: '10px' }}>
                <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ flex: 1, padding: '8px' }}
                />
                <button type="submit" disabled={loading || !commentText.trim()}>
                    Post
                </button>
            </form>

            <p style={{ color: '#888', fontSize: '0.8rem', margin: '5px 0' }}>
                {new Date(post.createdAt).toLocaleDateString()}
            </p>
        </div>
    );
};

export default Post;
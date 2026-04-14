import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../apiConfig';

/* ─── SVG Icons (pixel-perfect, like Instagram's) ─── */
const HeartIcon = ({ filled, style }) =>
  filled ? (
    <svg style={style} aria-label="Unlike" viewBox="0 0 48 48" width="24" height="24">
      <path fill="#ed4956" d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.8-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 9.2 7.4.7.4 1.5.6 2 .6.7 0 1.4-.2 2-.6 2.6-1.6 4.8-3.6 9.2-7.4l2-1.7c.7-.6 1.4-1.2 2.1-1.8C42.4 29.6 48 25 48 17.6c0-8-6.1-14.5-13.4-14.5z"/>
    </svg>
  ) : (
    <svg style={style} aria-label="Like" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );

const CommentIcon = () => (
  <svg aria-label="Comment" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const ShareIcon = () => (
  <svg aria-label="Share Post" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);



const MoreIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
  </svg>
);

const EmojiIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

/* ─── Helpers ─── */
const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const w = Math.floor(d / 7);
  if (w > 0) return `${w}w`;
  if (d > 0) return `${d}d`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return 'just now';
};

/* ─── Story ring gradient on avatar ─── */
const StoryAvatar = ({ src, alt, size = 32, hasStory = false }) => (
  <div style={{
    width: size + (hasStory ? 4 : 0),
    height: size + (hasStory ? 4 : 0),
    borderRadius: '50%',
    padding: hasStory ? '2px' : '0',
    background: hasStory ? 'linear-gradient(45deg,#f09433,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888)' : 'transparent',
    flexShrink: 0,
  }}>
    <div style={{ background: '#fff', borderRadius: '50%', padding: hasStory ? '2px' : '0' }}>
      <img
        src={src || '/default-avatar.png'}
        alt={alt}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  </div>
);

/* ─── Main Post Component ─── */
const Post = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [liked, setLiked]           = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [comments, setComments]     = useState([]);
  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showHeart, setShowHeart]   = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lastTap, setLastTap]       = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const commentRef = useRef(null);
  const optionsRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchLikes(); fetchComments(); }, [post._id]);

  const fetchLikes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/likes/${post._id}`);
      setLikesCount(res.data.length);
      if (user) setLiked(res.data.some(l => l.user._id === user._id));
    } catch {}
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/comments/post/${post._id}`);
      setComments(res.data);
    } catch {}
  };

  const triggerLike = async () => {
    if (!user || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/likes/${post._id}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(res.data.liked);
      setLikesCount(p => res.data.liked ? p + 1 : p - 1);
    } catch {} finally { setLikeLoading(false); }
  };

  /* Double-tap to like on image */
  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (!liked) {
        triggerLike();
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 1000);
      }
    }
    setLastTap(now);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/comments/${post._id}`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(p => [res.data, ...p]);
      setCommentText('');
    } catch {} finally { setLoading(false); }
  };

  const handleDeleteComment = async (cId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/comments/${cId}`, { headers: { Authorization: `Bearer ${token}` } });
      setComments(p => p.filter(c => c._id !== cId));
    } catch {}
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      navigator.share({ title: `Post by ${post.user.username}`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/posts/${post._id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (onDelete) onDelete(post._id);
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const previewComments = showAllComments ? comments : comments.slice(0, 2);

  return (
    <>
      <style>{`
        .post-wrap {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          margin-bottom: 12px;
          animation: fadeIn 0.4s var(--ease);
        }

        @media (max-width: 600px) {
          .post-wrap { border-radius: 0; border-left: none; border-right: none; }
        }

        /* Header */
        .post-header {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          gap: 10px;
        }
        .post-user-info { flex: 1; min-width: 0; }
        .post-username {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .post-username:hover { text-decoration: underline; }
        .post-loc {
          font-size: 12px;
          color: var(--text-muted);
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .post-more {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text);
          padding: 4px;
          display: flex;
          border-radius: 4px;
          transition: background 0.15s;
        }
        .post-more:hover { background: var(--bg); }
        .post-options-menu {
          position: absolute;
          top: 40px;
          right: 16px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 20;
          overflow: hidden;
        }
        .post-options-btn {
          display: block;
          width: 100%;
          padding: 10px 16px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
          color: var(--red);
          font-weight: 600;
          text-align: left;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .post-options-btn:hover { background: var(--bg); }

        /* Media */
        .post-media-wrap { position: relative; background: #f0f0f0; cursor: pointer; }
        .post-img, .post-video {
          width: 100%;
          max-height: 600px;
          object-fit: cover;
          display: block;
          transition: opacity 0.35s var(--ease);
        }
        .post-video { max-height: 600px; background: #000; }
        .double-tap-heart {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 80px;
          pointer-events: none;
          animation: doubleTapHeart 0.9s var(--ease) forwards;
          filter: drop-shadow(0 4px 24px rgba(0,0,0,0.3));
          z-index: 10;
        }

        /* Actions */
        .post-actions {
          display: flex;
          align-items: center;
          padding: 8px 16px 4px;
          gap: 4px;
        }
        .act-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text);
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          transition: transform 0.12s var(--spring), color 0.15s;
        }
        .act-btn:hover { transform: scale(1.1); }
        .act-btn:active { transform: scale(0.9); }
        .act-btn.liked { animation: heartPop 0.35s var(--spring); }
        .spacer { flex: 1; }

        /* Likes */
        .post-likes {
          padding: 0 16px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 2px 0;
        }

        /* Caption */
        .post-caption {
          padding: 4px 16px;
          font-size: 14px;
          color: var(--text);
          line-height: 1.5;
        }
        .cap-author {
          font-weight: 600;
          margin-right: 4px;
          color: var(--text);
        }
        .cap-author:hover { text-decoration: underline; }

        /* Comments */
        .view-more-btn {
          display: block;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 14px;
          font-family: var(--font-body);
          padding: 2px 16px;
          text-align: left;
          transition: color 0.15s;
        }
        .view-more-btn:hover { color: var(--text); }

        .comments-list { padding: 4px 16px 0; }
        .comment-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 4px 0;
          font-size: 14px;
          color: var(--text);
          line-height: 1.5;
        }
        .comment-author {
          font-weight: 600;
          margin-right: 4px;
          flex-shrink: 0;
          color: var(--text);
        }
        .comment-author:hover { text-decoration: underline; }
        .comment-text { flex: 1; word-break: break-word; }
        .comment-del {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-light);
          font-size: 11px;
          font-family: var(--font-body);
          padding: 0;
          flex-shrink: 0;
          margin-top: 2px;
          transition: color 0.15s;
        }
        .comment-del:hover { color: var(--red); }

        /* Timestamp */
        .post-time {
          display: block;
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 4px 16px 8px;
        }

        /* Comment input */
        .comment-form {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px 12px;
          border-top: 1px solid var(--border-light);
          margin-top: 4px;
        }
        .comment-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--text);
          caret-color: var(--blue);
        }
        .comment-input::placeholder { color: var(--text-light); }
        .post-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--blue);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 700;
          padding: 0;
          transition: opacity 0.15s;
          white-space: nowrap;
        }
        .post-btn:disabled { opacity: 0.3; cursor: default; }
        .post-btn:hover:not(:disabled) { opacity: 0.7; }
      `}</style>

      <div className="post-wrap">
        {/* ── Header ── */}
        <div className="post-header">
          <Link to={`/profile/${post.user.username}`}>
            <StoryAvatar src={post.user.profilePicture} alt={post.user.username} size={32} />
          </Link>
          <div className="post-user-info">
            <Link to={`/profile/${post.user.username}`} className="post-username">{post.user.username}</Link>
            {post.location && <span className="post-loc">📍 {post.location}</span>}
          </div>
          {user && user._id === post.user._id && (
            <div style={{ position: 'relative' }} ref={optionsRef}>
              <button 
                className="post-more" 
                onClick={() => setShowOptions(!showOptions)}
              >
                <MoreIcon />
              </button>
              {showOptions && (
                <div className="post-options-menu">
                  <button className="post-options-btn" onClick={handleDeletePost}>Delete post</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Media ── */}
        <div className="post-media-wrap" onClick={handleImageTap}>
          {showHeart && <div className="double-tap-heart">❤️</div>}
          {post.type === 'reel' || (post.mediaUrl && post.mediaUrl.includes('/video/')) ? (
            <video src={post.mediaUrl} controls className="post-video" onClick={e => e.stopPropagation()} />
          ) : (
            <img
              src={post.mediaUrl}
              alt=""
              className="post-img"
              style={{ opacity: imageLoaded ? 1 : 0 }}
              onLoad={() => setImageLoaded(true)}
            />
          )}
        </div>

        {/* ── Actions ── */}
        <div className="post-actions">
          <button
            className={`act-btn${liked ? ' liked' : ''}`}
            onClick={triggerLike}
            disabled={likeLoading}
          >
            <HeartIcon filled={liked} />
          </button>
          <button
            className="act-btn"
            onClick={() => commentRef.current?.focus()}
          >
            <CommentIcon />
          </button>
          <button className="act-btn" onClick={handleShare}><ShareIcon /></button>
          <div className="spacer" />

        </div>

        {/* ── Likes count ── */}
        <div className="post-likes">
          {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
        </div>

        {/* ── Caption ── */}
        {post.caption && (
          <div className="post-caption">
            <Link to={`/profile/${post.user.username}`} className="cap-author">{post.user.username}</Link>
            {post.caption}
          </div>
        )}

        {/* ── Comments ── */}
        {comments.length > 2 && !showAllComments && (
          <button className="view-more-btn" onClick={() => setShowAllComments(true)}>
            View all {comments.length} comments
          </button>
        )}

        {comments.length > 0 && (
          <div className="comments-list">
            {previewComments.map(c => (
              <div key={c._id} className="comment-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/profile/${c.user.username}`} className="comment-author">{c.user.username}</Link>
                  <span className="comment-text">{c.text}</span>
                </div>
                {(c.user._id === user?._id || post.user._id === user?._id) && (
                  <button className="comment-del" onClick={() => handleDeleteComment(c._id)}>✕</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Timestamp ── */}
        <span className="post-time">{timeAgo(post.createdAt)} ago</span>

        {/* ── Add comment ── */}
        <form className="comment-form" onSubmit={handleAddComment}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}><EmojiIcon /></span>
          <input
            ref={commentRef}
            className="comment-input"
            type="text"
            placeholder="Add a comment…"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            disabled={!user}
          />
          <button
            type="submit"
            className="post-btn"
            disabled={loading || !commentText.trim() || !user}
          >
            Post
          </button>
        </form>
      </div>
    </>
  );
};

export default Post;
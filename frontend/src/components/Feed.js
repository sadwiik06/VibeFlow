import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from './Post';
import CreatePost from './CreatePost';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import API_BASE_URL from '../apiConfig';

/* ─── Skeleton ─── */
const PostSkeleton = ({ delay = 0 }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #E4E4E2',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '12px',
    animation: `fadeUp 0.35s ${delay}s ease both`,
  }}>
    <style>{`@keyframes fadeUp { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform:translateY(0);} }`}</style>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px' }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#F2F2F0', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)', animation: 'shimmer 1.4s ease infinite' }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ height: 11, width: '30%', borderRadius: '6px', background: '#F2F2F0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)', animation: 'shimmer 1.4s ease infinite' }} />
        </div>
        <div style={{ height: 9, width: '18%', borderRadius: '6px', background: '#F2F2F0' }} />
      </div>
    </div>
    <div style={{ height: 340, background: '#F7F7F5', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)', animation: 'shimmer 1.4s ease infinite' }} />
    </div>
    <div style={{ padding: '12px 16px 16px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {[30, 30, 30].map((s, i) => (
          <div key={i} style={{ width: s, height: s, borderRadius: '50%', background: '#F2F2F0' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        <div style={{ height: 10, width: '25%', borderRadius: '5px', background: '#F2F2F0' }} />
        <div style={{ height: 10, width: '65%', borderRadius: '5px', background: '#F2F2F0' }} />
        <div style={{ height: 10, width: '45%', borderRadius: '5px', background: '#F2F2F0' }} />
      </div>
    </div>
    <style>{`@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }`}</style>
  </div>
);

/* ─── Feed ─── */
const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const { socket } = useChat();

  const fetchPosts = async (pageNum = 1) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${API_BASE_URL}/api/posts/feed?page=${pageNum}&limit=5`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (pageNum === 1) setPosts(res.data.posts);
      else setPosts(p => [...p, ...res.data.posts]);
      setHasMore(res.data.page < res.data.pages);
    } catch {
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  // Real-time: listen for new posts from other users
  useEffect(() => {
    if (!socket || !user) return;
    const handleNewPost = (post) => {
      // Skip own posts (already added locally via handlePostCreated)
      if (post.user?._id === user._id) return;
      setPosts(prev => [post, ...prev]);
    };
    socket.on('new feed post', handleNewPost);
    return () => socket.off('new feed post', handleNewPost);
  }, [socket, user]);

  const handlePostCreated = (newPost) => setPosts(p => [newPost, ...p]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    fetchPosts(next);
  };

  return (
    <>
      <style>{`
        .lf-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 0 0 80px;
        }
        .lf-load-more {
          width: 100%;
          padding: 11px;
          background: #fff;
          border: 1px solid #E4E4E2;
          border-radius: 12px;
          color: #6C63FF;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          margin-top: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.15s ease;
          letter-spacing: -0.01em;
        }
        .lf-load-more:hover:not(:disabled) {
          background: #F7F7F5;
          border-color: #6C63FF;
        }
        .lf-load-more:disabled { opacity: 0.4; cursor: default; }
        .lf-spinner {
          width: 14px; height: 14px;
          border: 2px solid #E4E4E2;
          border-top-color: #6C63FF;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .lf-end {
          text-align: center;
          padding: 24px;
          color: #C0C0BE;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          letter-spacing: 0.03em;
        }
        .lf-end::before, .lf-end::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #E4E4E2;
          max-width: 60px;
        }
        .lf-empty {
          background: #fff;
          border: 1px solid #E4E4E2;
          border-radius: 16px;
          padding: 56px 24px;
          text-align: center;
        }
        .lf-error {
          background: #fff;
          border: 1px solid #E4E4E2;
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
        }
        .lf-retry {
          background: #0A0A0A;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          padding: 10px 24px;
          cursor: pointer;
          margin-top: 16px;
          letter-spacing: -0.01em;
          transition: background 0.15s;
        }
        .lf-retry:hover { background: #2A2A2A; }
      `}</style>

      <div className="lf-container">
        <CreatePost onPostCreated={handlePostCreated} />

        {loading && [0, 0.07, 0.14].map((d, i) => <PostSkeleton key={i} delay={d} />)}

        {error && !loading && (
          <div className="lf-error">
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
            <p style={{ color: '#5A5A5A', margin: '0 0 4px', fontWeight: '500' }}>Something went wrong</p>
            <p style={{ color: '#9A9A9A', fontSize: '13px', margin: 0 }}>{error}</p>
            <button className="lf-retry" onClick={() => { setLoading(true); setError(''); fetchPosts(1); }}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="lf-empty">
            <div style={{ fontSize: '44px', marginBottom: '14px' }}>📸</div>
            <div style={{ fontSize: '17px', fontWeight: '700', color: '#0A0A0A', marginBottom: '6px', letterSpacing: '-0.02em' }}>
              Your feed is empty
            </div>
            <div style={{ fontSize: '13px', color: '#9A9A9A', lineHeight: '1.6', maxWidth: '260px', margin: '0 auto' }}>
              Follow people to see their posts here, or share your first post above.
            </div>
          </div>
        )}

        {posts.map(post => <Post key={post._id} post={post} onDelete={(id) => setPosts(p => p.filter(x => x._id !== id))} />)}

        {!loading && !error && posts.length > 0 && (
          hasMore ? (
            <button className="lf-load-more" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? <><div className="lf-spinner" /> Loading</> : 'Load more posts'}
            </button>
          ) : (
            <div className="lf-end">You're all caught up</div>
          )
        )}
      </div>
    </>
  );
};

export default Feed;
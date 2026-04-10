import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from './Post';
import CreatePost from './CreatePost';
import { useAuth } from '../context/AuthContext';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { user } = useAuth();

    const fetchPosts = async (pageNum = 1) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/posts/feed?page=${pageNum}&limit=5`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (pageNum === 1) {
                setPosts(res.data.posts);
            } else {
                setPosts(prev => [...prev, ...res.data.posts]);
            }
            
            setHasMore(res.data.page < res.data.pages);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch posts');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage);
    };

    if (loading && page === 1) return <div>Loading feed...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <CreatePost onPostCreated={handlePostCreated} />
            {posts.map(post => (
                <Post key={post._id} post={post} />
            ))}
            {hasMore && (
                <button onClick={loadMore} style={{ display: 'block', margin: '20px auto', padding: '10px 20px' }}>
                    Load More
                </button>
            )}
        </div>
    );
};

export default Feed;

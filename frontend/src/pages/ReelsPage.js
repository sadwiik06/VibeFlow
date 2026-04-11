import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import ReelItem from '../components/ReelItem';
import { useAuth } from '../context/AuthContext';

const ReelsPage = () => {
    const [reels, setReels] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState('');
    const observer = useRef();
    const { user } = useAuth();
    const token = localStorage.getItem('token');

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

    if (loading && reels.length === 0) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading reels...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
    }

    return (
        <div className="reels-container">
            {reels.map((reel, index) => {
                if (reels.length === index + 1) {
                    return (
                        <div ref={lastReelElementRef} key={reel._id}>
                            <ReelItem reel={reel} />
                        </div>
                    );
                } else {
                    return <ReelItem key={reel._id} reel={reel} />;
                }
            })}
            {loading && page > 1 && <div>Loading more...</div>}
        </div>
    );
};

export default ReelsPage;

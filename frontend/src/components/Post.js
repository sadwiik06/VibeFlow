import React from 'react';
import { Link } from 'react-router-dom';

const Post = ({ post }) => {
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

            <div style={{ marginTop: '10px' }}>
                <p style={{ margin: '5px 0' }}>
                    <strong>{post.user.username}</strong> {post.caption}
                </p>
                <p style={{ color: '#888', fontSize: '0.8rem', margin: '5px 0' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

export default Post;
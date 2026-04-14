import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchFollowRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/follow-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching follow requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowRequests();
  }, [token]);

  const handleAction = async (requestId, action) => {
    try {
      await axios.post(`${API_BASE_URL}/api/users/follow-requests/${requestId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.filter(req => req._id !== requestId));
    } catch (err) {
      console.error(`Error ${action}ing request`, err);
    }
  };

  return (
    <>
      <style>{`
        .notif-page {
          max-width: 600px; margin: 0 auto;
          padding: 30px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .notif-title { font-size: 24px; font-weight: 700; margin-bottom: 24px; color: #1a1a1a; }
        .notif-list { display: flex; flex-direction: column; gap: 1px; background: #EFEFEF; border-radius: 12px; overflow: hidden; border: 1px solid #EFEFEF; }
        .notif-item {
          display: flex; align-items: center; gap: 12px;
          padding: 16px; background: #fff;
          transition: background 0.15s;
        }
        .notif-item:hover { background: #fafafa; }
        .notif-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          object-fit: cover; border: 1px solid #efefef;
        }
        .notif-content { flex: 1; min-width: 0; }
        .notif-text { font-size: 14px; color: #1a1a1a; line-height: 1.4; }
        .notif-username { font-weight: 700; text-decoration: none; color: #1a1a1a; }
        .notif-actions { display: flex; gap: 8px; margin-top: 4px; }
        .notif-btn {
          padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: opacity 0.15s;
        }
        .btn-confirm { background: #0095f6; color: #fff; }
        .btn-delete { background: #efefef; color: #1a1a1a; }
        .notif-btn:hover { opacity: 0.85; }

        .empty-state { text-align: center; padding: 60px 20px; color: #8e8e8e; }
      `}</style>

      <div className="notif-page">
        <h1 className="notif-title">Notifications</h1>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : requests.length > 0 ? (
          <div className="notif-list">
            {requests.map(req => (
              <div key={req._id} className="notif-item">
                <img src={req.from?.profilePicture || '/default-avatar.png'} alt="" className="notif-avatar" />
                <div className="notif-content">
                  <div className="notif-text">
                    <Link to={`/profile/${req.from?.username}`} className="notif-username">{req.from?.username}</Link>
                    {' sent you a follow request.'}
                  </div>
                  <div className="notif-actions">
                    <button className="notif-btn btn-confirm" onClick={() => handleAction(req._id, 'accept')}>Confirm</button>
                    <button className="notif-btn btn-delete" onClick={() => handleAction(req._id, 'reject')}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
            <p>No new notifications.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsPage;

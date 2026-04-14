import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const GuildMembers = ({ guild, onRefresh, canManage }) => {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const handleRequest = async (userId, action) => {
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/guilds/${guild._id}/requests/${userId}`, 
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRefresh();
    } catch (err) {
      alert('Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
      <h3>Members ({guild.memberCount})</h3>
      <div>
        {guild.members.map(member => (
          <div key={member._id} style={{ display: 'flex', alignItems: 'center', padding: '5px' }}>
            <img src={member.profilePicture || '/default-avatar.png'} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }} />
            <span>{member.username}</span>
            {guild.owner._id === member._id && <span style={{ marginLeft: '10px', color: 'gold' }}>👑 Owner</span>}
          </div>
        ))}
      </div>

      {canManage && guild.pendingRequests?.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h4>Pending Requests</h4>
          {guild.pendingRequests.map(user => (
            <div key={user._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px' }}>
              <span>{user.username}</span>
              <div>
                <button onClick={() => handleRequest(user._id, 'approve')} disabled={loading}>Approve</button>
                <button onClick={() => handleRequest(user._id, 'reject')} disabled={loading}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuildMembers;
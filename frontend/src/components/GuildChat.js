import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../apiConfig';
import { useChat } from '../context/ChatContext';

const GuildChat = ({ guildId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { socket } = useChat();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchMessages();
    if (socket) {
      socket.on('new guild message', (message) => {
        if (message.guild === guildId) {
          setMessages(prev => [...prev, message]);
        }
      });
    }
    return () => {
      if (socket) socket.off('new guild message');
    };
  }, [guildId, socket]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/guilds/${guildId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    socket.emit('send guild message', { guildId, text: newMessage }, (response) => {
      if (response.error) {
        alert(response.error);
      } else {
        setNewMessage('');
      }
    });
  };

  if (loading) return <div>Loading messages...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
        {messages.map(msg => (
          <div key={msg._id} style={{ display: 'flex', marginBottom: '10px' }}>
            <img src={msg.sender.profilePicture || '/default-avatar.png'} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '8px' }} />
            <div>
              <strong>{msg.sender.username}</strong>
              <p style={{ margin: '2px 0' }}>{msg.text}</p>
              <span style={{ fontSize: '0.7rem', color: '#666' }}>
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ccc' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Message..."
          style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ marginLeft: '10px', padding: '10px 20px', borderRadius: '20px', border: 'none', background: '#0095f6', color: 'white' }}>Send</button>
      </form>
    </div>
  );
};

export default GuildChat;
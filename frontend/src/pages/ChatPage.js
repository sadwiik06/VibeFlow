import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../apiConfig';
import { useChat } from '../context/ChatContext';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket } = useChat();
  const token = localStorage.getItem('token');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (message) => {
      setConversations(prev => {
        const updated = prev.map(c =>
          c._id === message.conversation ? { ...c, lastMessage: message } : c
        );
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    };
    socket.on('new message', onNewMessage);
    return () => socket.off('new message', onNewMessage);
  }, [socket]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSelectConversation = (conv) => setSelectedConversation(conv);

  return (
    <>
      <style>{`
        .chat-page {
          display: flex; height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #fff;
        }

        /* Left panel */
        .chat-left {
          width: 360px; flex-shrink: 0;
          border-right: 1px solid #F0F0F0;
          display: flex; flex-direction: column;
          background: #fff;
        }
        .chat-left-header {
          padding: 20px 20px 14px;
          border-bottom: 1px solid #F0F0F0;
          display: flex; align-items: center; justify-content: space-between;
        }
        .chat-left-title {
          font-size: 18px; font-weight: 800; color: #1a1a1a;
          letter-spacing: -0.3px;
        }
        .chat-new-btn {
          width: 34px; height: 34px; border-radius: 10px;
          border: 1.5px solid #EFEFEF;
          background: #fff; cursor: pointer; color: #1a1a1a;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, border-color 0.15s;
        }
        .chat-new-btn:hover { background: #F5F5F5; border-color: #d0d0d0; }

        /* Search inside left panel */
        .chat-search {
          padding: 12px 16px;
          border-bottom: 1px solid #F8F8F8;
        }
        .chat-search-inner {
          display: flex; align-items: center; gap: 8px;
          background: #F5F5F5; border-radius: 10px;
          padding: 8px 12px;
        }
        .chat-search-inner input {
          background: none; border: none; outline: none;
          font-size: 13px; color: #1a1a1a; flex: 1; font-family: inherit;
        }
        .chat-search-inner input::placeholder { color: #aaa; }

        /* Conversations list */
        .chat-conv-list { flex: 1; overflow-y: auto; }
        .chat-conv-list::-webkit-scrollbar { width: 0; }

        /* Empty state */
        .chat-loading {
          display: flex; align-items: center; justify-content: center;
          flex: 1; flex-direction: column; gap: 12px; color: #aaa;
          padding: 40px; text-align: center;
        }
        .chat-loading-spinner {
          width: 28px; height: 28px; border-radius: 50%;
          border: 2.5px solid #EFEFEF;
          border-top-color: #1a1a1a;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Right panel */
        .chat-right {
          flex: 1; display: flex; flex-direction: column;
          background: #fff; min-width: 0;
        }

        /* Empty right panel */
        .chat-empty-right {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 14px; color: #aaa; padding: 40px;
        }
        .chat-empty-icon {
          width: 80px; height: 80px; border-radius: 50%;
          border: 2px solid #DBDBDB;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 6px;
        }
        .chat-empty-right h3 { font-size: 22px; font-weight: 300; color: #1a1a1a; margin: 0; }
        .chat-empty-right p { font-size: 14px; color: #888; margin: 0; }
        .chat-empty-btn {
          margin-top: 8px; padding: 10px 22px; border-radius: 12px;
          background: #1a1a1a; color: #fff;
          border: none; cursor: pointer;
          font-size: 14px; font-weight: 600; font-family: inherit;
          transition: opacity 0.15s;
        }
        .chat-empty-btn:hover { opacity: 0.85; }

        @media (max-width: 768px) {
          .chat-left { width: 100%; display: ${selectedConversation ? 'none' : 'flex'}; }
          .chat-right { display: ${selectedConversation ? 'flex' : 'none'}; }
        }
      `}</style>

      <div className="chat-page">
        {/* Left: Conversation list */}
        <div className="chat-left">
          <div className="chat-left-header">
            <span className="chat-left-title">{user?.username}</span>
            <button className="chat-new-btn" title="New message">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
              </svg>
            </button>
          </div>

          <div className="chat-search">
            <div className="chat-search-inner">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input placeholder="Search messages…" />
            </div>
          </div>

          <div className="chat-conv-list">
            {loading ? (
              <div className="chat-loading">
                <div className="chat-loading-spinner" />
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversation?._id}
                onSelect={handleSelectConversation}
                currentUserId={user._id}
              />
            )}
          </div>
        </div>

        {/* Right: Chat window or empty state */}
        <div className="chat-right">
          {selectedConversation ? (
            <ChatWindow conversation={selectedConversation} />
          ) : (
            <div className="chat-empty-right">
              <div className="chat-empty-icon">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#DBDBDB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3>Your messages</h3>
              <p>Send a message to start a conversation.</p>
              <button className="chat-empty-btn" onClick={() => {}}>
                Send message
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatPage;
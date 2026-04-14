import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../apiConfig';
import { useChat } from '../context/ChatContext';
import VoiceRecorder from './VoiceRecorder';

const ChatWindow = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userTyping, setUserTyping] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { socket } = useChat();
  const token = localStorage.getItem('token');
  const otherUser = conversation.participants.find(p => p._id !== user._id);

  useEffect(() => {
    fetchMessages();
    if (!socket) return;
    socket.emit('join conversation', conversation._id);
    socket.on('new message', (msg) => {
      const id = msg.conversation._id || msg.conversation;
      if (id === conversation._id && msg.sender._id !== user._id)
        setMessages(prev => [...prev, msg]);
    });
    socket.on('user typing', ({ userId, username, isTyping }) => {
      if (userId === otherUser._id) setUserTyping(isTyping ? username : null);
    });
    socket.on('messages read', ({ conversationId, userId }) => {
      if (conversationId === conversation._id && userId !== user._id)
        setMessages(prev => prev.map(m => ({ ...m, read: true })));
    });
    return () => {
      socket.emit('leave conversation', conversation._id);
      socket.off('new message');
      socket.off('user typing');
      socket.off('messages read');
    };
  }, [conversation._id, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (socket && messages.some(m => !m.read && m.sender._id !== user._id))
      socket.emit('mark read', { conversationId: conversation._id });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/chat/conversations/${conversation._id}/messages`, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket?.emit('typing', { conversationId: conversation._id, isTyping: e.target.value.length > 0 });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    const text = newMessage;
    setNewMessage('');
    socket?.emit('typing', { conversationId: conversation._id, isTyping: false });
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { _id: tempId, conversation: conversation._id, sender: user, text, mediaType: 'text', createdAt: new Date().toISOString(), pending: true }]);
    socket?.emit('send message', { conversationId: conversation._id, text }, (res) => {
      if (res.error) setMessages(prev => prev.filter(m => m._id !== tempId));
      else setMessages(prev => prev.map(m => m._id === tempId ? res.message : m));
    });
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const d = new Date(msg.createdAt).toDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(msg);
    return acc;
  }, {});

  const dateLabel = (s) => {
    const d = new Date(s), t = new Date(), y = new Date(t); y.setDate(y.getDate() - 1);
    if (d.toDateString() === t.toDateString()) return 'Today';
    if (d.toDateString() === y.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <style>{`
        .cw { display: flex; flex-direction: column; height: 100%; background: #fff; }
        .cw-header {
          padding: 12px 20px; border-bottom: 1px solid #E4E4E2;
          display: flex; align-items: center; gap: 12px; flex-shrink: 0;
          background: #fff;
        }
        .cw-avatar { width: 36px; height: 36px; border-radius: '50%'; object-fit: cover; display: block; border-radius: 50%; border: 1.5px solid #E4E4E2; }
        .cw-haction { width: 32px; height: 32px; border-radius: '8px'; background: #F7F7F5; border: 1px solid #E4E4E2; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #5A5A5A; transition: all 0.12s; border-radius: 8px; }
        .cw-haction:hover { background: #EEEEFF; color: #6C63FF; border-color: #6C63FF; }
        .cw-msgs { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 2px; }
        .cw-date-div { text-align: center; margin: 16px 0 8px; position: relative; }
        .cw-date-div span { font-size: 11px; color: #C0C0BE; background: #fff; padding: 0 10px; position: relative; z-index: 1; letter-spacing: 0.03em; }
        .cw-date-div::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #F2F2F0; }
        .cw-row { display: flex; align-items: flex-end; gap: 7px; margin-bottom: 1px; }
        .cw-row.own { flex-direction: row-reverse; }
        .cw-av { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        .cw-av.hide { opacity: 0; }
        .cw-bubble {
          max-width: 66%; padding: 9px 14px; border-radius: 18px; font-size: 14px;
          line-height: 1.45; word-break: break-word; position: relative;
        }
        .cw-bubble.own { background: #0A0A0A; color: #fff; border-bottom-right-radius: 5px; }
        .cw-bubble.other { background: #F2F2F0; color: #0A0A0A; border-bottom-left-radius: 5px; }
        .cw-bubble.pending { opacity: 0.6; }
        .cw-meta { font-size: 10px; margin-top: 2px; opacity: 0.55; display: flex; align-items: center; justify-content: flex-end; gap: 3px; }
        .cw-typing { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #9A9A9A; font-style: italic; padding: 4px 0; }
        .cw-dots { display: flex; gap: 3px; }
        .cw-dot { width: 5px; height: 5px; border-radius: 50%; background: #C0C0BE; animation: dotB 1.2s ease-in-out infinite; }
        .cw-dot:nth-child(2) { animation-delay: 0.2s; }
        .cw-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotB { 0%,80%,100%{transform:scale(0.7);opacity:0.5} 40%{transform:scale(1);opacity:1} }
        .cw-input-wrap { padding: 12px 16px; border-top: 1px solid #E4E4E2; background: #fff; flex-shrink: 0; }
        .cw-input-inner { display: flex; align-items: center; background: #F7F7F5; border: 1px solid #E4E4E2; border-radius: 14px; padding: 4px 6px 4px 14px; gap: 8px; transition: border-color 0.15s; }
        .cw-input-inner:focus-within { border-color: #6C63FF; background: #fff; }
        .cw-text { flex: 1; border: none; background: none; font-size: 14px; color: #0A0A0A; outline: none; padding: 7px 0; font-family: inherit; }
        .cw-text::placeholder { color: #C0C0BE; }
        .cw-send { width: 32px; height: 32px; border-radius: 9px; border: none; background: #0A0A0A; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.15s; }
        .cw-send:hover { background: #2A2A2A; }
        .cw-send:active { transform: scale(0.93); }
        .cw-loading { flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 10px; color: #9A9A9A; font-size: 13px; }
        .cw-spinner { width: 26px; height: 26px; border-radius: 50%; border: 2px solid #E4E4E2; border-top-color: #6C63FF; animation: spin 0.8s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
      `}</style>

      <div className="cw">
        <div className="cw-header">
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={otherUser.profilePicture || '/default-avatar.png'} className="cw-avatar" alt="" />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: '50%', background: '#16A34A', border: '2px solid #fff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0A0A0A', letterSpacing: '-0.01em' }}>{otherUser.username}</div>
            <div style={{ fontSize: '11px', color: '#9A9A9A' }}>Active now</div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
            ].map((icon, i) => (
              <button key={i} className="cw-haction">{icon}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="cw-loading"><div className="cw-spinner" />Loading messages…</div>
        ) : (
          <div className="cw-msgs">
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <React.Fragment key={date}>
                <div className="cw-date-div"><span>{dateLabel(date)}</span></div>
                {msgs.map((msg, i) => {
                  const own = msg.sender._id === user._id;
                  const next = msgs[i + 1];
                  const showAv = !own && (!next || next.sender._id !== msg.sender._id);
                  return (
                    <div key={msg._id} className={`cw-row ${own ? 'own' : ''}`}>
                      {!own && <img src={msg.sender.profilePicture || '/default-avatar.png'} className={`cw-av ${showAv ? '' : 'hide'}`} alt="" />}
                      <div className={`cw-bubble ${own ? 'own' : 'other'} ${msg.pending ? 'pending' : ''}`}>
                        {msg.mediaType === 'voice'
                          ? <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <audio src={msg.mediaUrl} controls style={{ maxWidth: '200px', height: '30px', filter: own ? 'invert(1)' : 'none' }} />
                              {msg.duration > 0 && <span style={{ fontSize: '11px', opacity: 0.6 }}>{msg.duration}s</span>}
                            </div>
                          : <span>{msg.text}</span>
                        }
                        <div className="cw-meta">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {own && !msg.pending && <span style={{ letterSpacing: '-0.05em' }}>{msg.read ? '✓✓' : '✓'}</span>}
                          {msg.pending && <span>·</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
            {userTyping && (
              <div className="cw-typing">
                <div className="cw-dots"><div className="cw-dot"/><div className="cw-dot"/><div className="cw-dot"/></div>
                {userTyping} is typing
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="cw-input-wrap">
          <div className="cw-input-inner">
            <input
              className="cw-text"
              placeholder="Message…"
              value={newMessage}
              onChange={handleTyping}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
            />
            {newMessage.trim()
              ? <button className="cw-send" onClick={handleSubmit}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              : <div style={{ position: 'relative', display: 'flex' }}>
                  <span style={{ position: 'absolute', bottom: '100%', right: '0', marginBottom: '8px', background: '#ffd700', color: '#000', fontSize: '10px', fontWeight: '800', padding: '3px 6px', borderRadius: '4px', letterSpacing: '0.5px', whiteSpace: 'nowrap', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', animation: 'bounce 2s infinite', zIndex: 10 }}>
                    NEW
                    <div style={{ position: 'absolute', top: '100%', right: '10px', borderWidth: '4px', borderStyle: 'solid', borderColor: '#ffd700 transparent transparent transparent' }} />
                  </span>
                  <VoiceRecorder conversationId={conversation._id} onVoiceSent={m => setMessages(prev => [...prev, m])} />
                </div>
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWindow;
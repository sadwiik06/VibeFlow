import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
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
        if (socket) {
            socket.emit('join conversation', conversation._id);

            socket.on('new message', (message) => {
                // Check if message belongs to this conversation
                const convoId = message.conversation._id || message.conversation;
                if (convoId === conversation._id && message.sender._id !== user._id) {
                    setMessages(prev => [...prev, message]);
                }
            });

            socket.on('user typing', ({ userId, username, isTyping }) => {
                if (userId === otherUser._id) {
                    setUserTyping(isTyping ? username : null);
                }
            });

            socket.on('messages read', ({ conversationId, userId }) => {
                if (conversationId === conversation._id && userId !== user._id) {
                    setMessages(prev => prev.map(msg => ({ ...msg, read: true })));
                }
            });
        }

        return () => {
            if (socket) {
                socket.emit('leave conversation', conversation._id);
                socket.off('new message');
                socket.off('user typing');
                socket.off('messages read');
            }
        };
    }, [conversation._id, socket]);

    useEffect(() => {
        scrollToBottom();
        if (socket && messages.filter(m => !m.read && m.sender._id !== user._id).length > 0) {
            socket.emit('mark read', { conversationId: conversation._id });
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/chat/conversations/${conversation._id}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setMessages(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch messages', err);
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (socket) {
            socket.emit('typing', { conversationId: conversation._id, isTyping: e.target.value.length > 0 });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const messageText = newMessage;
        setNewMessage('');
        
        if (socket) {
            socket.emit('typing', { conversationId: conversation._id, isTyping: false });
        }

        const tempId = Date.now().toString();
        const optimisticMessage = {
            _id: tempId,
            conversation: conversation._id,
            sender: user,
            text: messageText,
            mediaType: 'text',
            createdAt: new Date().toISOString(),
            pending: true,
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        
        socket.emit('send message', {
            conversationId: conversation._id,
            text: messageText,
        }, (response) => {
            if (response.error) {
                setMessages(prev => prev.filter(m => m._id !== tempId));
                alert(response.error);
            } else {
                setMessages(prev => prev.map(m => m._id === tempId ? response.message : m));
            }
        });
    };

    const handleVoiceSent = (message) => {
        setMessages(prev => [...prev, message]);
        // Also notify via socket if needed, though usually backend emits it
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading messages...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'white' }}>
            {/* Header */}
            <div style={{ padding: '15px', borderBottom: '1px solid #dbdbdb', display: 'flex', alignItems: 'center' }}>
                <img
                    src={otherUser.profilePicture || '/default-avatar.png'}
                    alt=""
                    style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '12px', objectFit: 'cover' }}
                />
                <span style={{ fontWeight: '600' }}>{otherUser.username}</span>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {messages.map(msg => (
                    <div
                        key={msg._id}
                        style={{
                            display: 'flex',
                            justifyContent: msg.sender._id === user._id ? 'flex-end' : 'flex-start',
                            marginBottom: '10px',
                        }}
                    >
                        <div
                            style={{
                                maxWidth: '70%',
                                padding: '10px 15px',
                                borderRadius: '22px',
                                backgroundColor: msg.sender._id === user._id ? '#0095f6' : '#efefef',
                                color: msg.sender._id === user._id ? 'white' : 'black',
                                opacity: msg.pending ? 0.7 : 1,
                                position: 'relative'
                            }}
                        >
                            {msg.mediaType === 'voice' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <audio 
                                        src={msg.mediaUrl} 
                                        controls 
                                        style={{ 
                                            maxWidth: '200px', 
                                            height: '30px',
                                            filter: msg.sender._id === user._id ? 'invert(1) hue-rotate(180deg)' : 'none' 
                                        }} 
                                    />
                                    {msg.duration > 0 && <span style={{fontSize: '0.7rem'}}>{msg.duration}s</span>}
                                </div>
                            ) : (
                                <p style={{ margin: 0, wordBreak: 'break-word' }}>{msg.text}</p>
                            )}
                            <span style={{ 
                                fontSize: '0.65rem', 
                                display: 'block', 
                                textAlign: 'right', 
                                marginTop: '4px',
                                opacity: 0.8
                            }}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {msg.sender._id === user._id && !msg.pending && (
                                    <span style={{ marginLeft: '4px' }}>
                                        {msg.read ? '✓✓' : '✓'}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                ))}

                {userTyping && (
                    <div style={{ fontStyle: 'italic', color: '#8e8e8e', fontSize: '0.9rem', marginBottom: '10px' }}>
                        {userTyping} is typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '15px', borderTop: '1px solid #dbdbdb' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #dbdbdb', borderRadius: '22px', padding: '5px 15px' }}>
                    <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleTyping}
                            placeholder="Message..."
                            style={{ flex: 1, padding: '8px 0', border: 'none', outline: 'none' }}
                        />
                        {newMessage.trim() && (
                            <button
                                type="submit"
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#0095f6', 
                                    fontWeight: '600', 
                                    cursor: 'pointer',
                                    padding: '0 5px'
                                }}
                            >
                                Send
                            </button>
                        )}
                    </form>
                    {!newMessage.trim() && (
                        <VoiceRecorder conversationId={conversation._id} onVoiceSent={handleVoiceSent} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;

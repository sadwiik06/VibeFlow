import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const ChatWindow = ({ conversation }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [typing, setTyping] = useState(false);
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
                if (message.conversation === conversation._id && message.sender._id !== user._id) {
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
        if (socket && messages.length > 0) {
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

    if (loading) return <div>Loading messages...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '15px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center' }}>
                <img
                    src={otherUser.profilePicture || '/default-avatar.png'}
                    alt=""
                    style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                />
                <span style={{ fontWeight: 'bold' }}>{otherUser.username}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
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
                                padding: '10px',
                                borderRadius: '18px',
                                backgroundColor: msg.sender._id === user._id ? '#0095f6' : '#e4e6eb',
                                color: msg.sender._id === user._id ? 'white' : 'black',
                                opacity: msg.pending ? 0.7 : 1,
                            }}
                        >
                            <p style={{ margin: 0 }}>{msg.text}</p>
                            <span style={{ fontSize: '0.7rem', display: 'block', textAlign: 'right' }}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {userTyping && (
                    <div style={{ fontStyle: 'italic', color: '#666' }}>
                        {userTyping} is typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ccc' }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Message..."
                    style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc' }}
                />
                <button
                    type="submit"
                    style={{ marginLeft: '10px', padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#0095f6', color: 'white', cursor: 'pointer' }}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;

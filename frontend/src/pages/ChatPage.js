import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
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

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('new message', (message) => {
                setConversations(prev => {
                    const updated = prev.map(conv => {
                        if (conv._id === message.conversation) {
                            return { ...conv, lastMessage: message };
                        }
                        return conv;
                    });
                    return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                });
            });

            socket.on('message notification', ({ conversationId, message }) => {
                // Handle notification (e.g., show a badge)
            });

            return () => {
                socket.off('new message');
                socket.off('message notification');
            };
        }
    }, [socket]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/chat/conversations', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setConversations(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch conversations', err);
            setLoading(false);
        }
    };

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
    };

    const startNewConversation = async (userId) => {
        try {
            const res = await axios.post(
                'http://localhost:5000/api/chat/conversations',
                { userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const exists = conversations.find(c => c._id === res.data._id);
            if (!exists) {
                setConversations([res.data, ...conversations]);
            }
            setSelectedConversation(res.data);
        } catch (err) {
            console.error('Failed to start conversation', err);
        }
    };

    if (loading) return <div>Loading conversations...</div>;

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
            <div style={{ width: '350px', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
                <ConversationList
                    conversations={conversations}
                    selectedId={selectedConversation?._id}
                    onSelect={handleSelectConversation}
                    currentUserId={user._id}
                />
            </div>
            <div style={{ flex: 1 }}>
                {selectedConversation ? (
                    <ChatWindow conversation={selectedConversation} />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <p>Select a conversation or start a new one from a user's profile</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
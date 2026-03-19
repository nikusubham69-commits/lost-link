import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import '../styles/Chat.css';

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [socket, setSocket] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    // Initialize socket connection
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const currentUserData = JSON.parse(localStorage.getItem('user'));
            setCurrentUser(currentUserData);
        } catch (err) {
            console.error('Error parsing user data:', err);
        }

        const newSocket = io(SOCKET_URL, {
            auth: { token }
        });

        newSocket.on('connect', () => {
            console.log('Connected to chat server');
        });

        newSocket.on('receiveMessage', (data) => {
            if (selectedConversation && data.conversationId === selectedConversation._id) {
                setMessages(prev => [...prev, data]);
            }
        });

        newSocket.on('userTyping', (data) => {
            // Handle typing indicator (optional)
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [selectedConversation]);

    // Fetch conversations
    useEffect(() => {
        fetchConversations();
        fetchUnreadCount();
    }, []);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(response.data);
        } catch (err) {
            console.error('Error fetching conversations:', err);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/chat/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(response.data.unreadCount);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    const loadChatHistory = async (conversation) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const conversationId = `${[conversation.otherUser._id, currentUser.id].sort().join('_')}`;
            
            const response = await axios.get(`${API_URL}/chat/history/${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessages(response.data);
            setSelectedConversation({ ...conversation, _id: conversationId });
            fetchUnreadCount();
        } catch (err) {
            console.error('Error loading chat history:', err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversation) return;

        try {
            const token = localStorage.getItem('token');
            const receiverId = selectedConversation.otherUser._id;

            const response = await axios.post(
                `${API_URL}/chat/send`,
                { receiverId, message: messageInput },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const newMessage = response.data;
            setMessages(prev => [...prev, newMessage]);
            setMessageInput('');

            // Emit via socket for real-time delivery
            if (socket) {
                socket.emit('sendMessage', {
                    ...newMessage,
                    conversationId: selectedConversation._id
                });
            }

            scrollToBottom();
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const deleteConversation = async (conversationId) => {
        if (window.confirm('Delete this conversation?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/chat/conversations/${conversationId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setConversations(prev => prev.filter(c => c._id !== conversationId));
                setSelectedConversation(null);
                setMessages([]);
            } catch (err) {
                console.error('Error deleting conversation:', err);
            }
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <div className="chat-header">
                    <h2>Messages</h2>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                    )}
                </div>

                <div className="conversations-list">
                    {conversations.length === 0 ? (
                        <div className="no-conversations">
                            <p>No conversations yet</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv._id}
                                className={`conversation-item ${
                                    selectedConversation?._id === conv._id ? 'active' : ''
                                }`}
                                onClick={() => loadChatHistory(conv)}
                            >
                                <div className="conversation-info">
                                    <h3>{conv.otherUser.name}</h3>
                                    <p className="last-message">
                                        {conv.lastMessage.message.substring(0, 40)}...
                                    </p>
                                </div>
                                <span className="conversation-time">
                                    {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="chat-main">
                {selectedConversation ? (
                    <>
                        <div className="chat-header-main">
                            <h2>{selectedConversation.otherUser.name}</h2>
                            <button
                                className="delete-btn"
                                onClick={() => deleteConversation(selectedConversation._id)}
                                title="Delete conversation"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="messages-container">
                            {loading ? (
                                <div className="loading">Loading messages...</div>
                            ) : messages.length === 0 ? (
                                <div className="no-messages">
                                    <p>Start a conversation</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`message ${
                                            msg.sender._id === currentUser.id ? 'sent' : 'received'
                                        }`}
                                    >
                                        <div className="message-bubble">
                                            {msg.message}
                                        </div>
                                        <span className="message-time">
                                            {new Date(msg.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-form" onSubmit={sendMessage}>
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                                className="message-input"
                            />
                            <button type="submit" className="send-btn">
                                Send
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-selected">
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;

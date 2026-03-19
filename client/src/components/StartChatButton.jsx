import axios from 'axios';

const StartChatButton = ({ userId, userName }) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleStartChat = async () => {
        try {
            // send a greeting message to open conversation
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/chat/send`,
                { receiverId: userId, message: `Hi ${userName}! 👋` },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            window.location.href = '/chat';
        } catch (err) {
            console.error('Error starting chat:', err);
            alert('Error starting chat');
        }
    };

    if (currentUser.id === userId) return null;

    return (
        <button
            onClick={handleStartChat}
            style={{
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                color: '#000',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}
        >
            💬 Message {userName}
        </button>
    );
};

export default StartChatButton;

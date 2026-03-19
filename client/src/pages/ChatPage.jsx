import Chat from '../components/Chat';

const ChatPage = () => {
    return (
        <div style={{ 
            padding: '20px', 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'
        }}>
            <Chat />
        </div>
    );
};

export default ChatPage;

import React, { useState, useEffect, useRef } from 'react';
import { chatbotStyles, colors } from '../styles';

const AIDA_SYSTEM = `You are AIDA, the futuristic AI assistant for 'Lost-Link GIET 2056' portal at GIET University, Balangir. Help students find lost items. Keep replies concise and helpful.`;

const getBotReply = (text) => {
  const msg = text.toLowerCase();
  if (msg.includes('lost') || msg.includes('missing')) {
    return "AIDA: Log a LOST report from the Post screen. Add clear title, description, and last seen location so the grid can track it.";
  }
  if (msg.includes('found')) {
    return "AIDA: Log a FOUND report from the Post screen. Mark type = FOUND so the owner and admin can confirm and resolve it.";
  }
  if (msg.includes('id') || msg.includes('code')) {
    return "AIDA: Every post is tagged with a unique LINK-ID. Share that ID with admin or the finder to quickly locate the report.";
  }
  if (msg.includes('notify') || msg.includes('message') || msg.includes('active')) {
    return "AIDA: All active terminals receive an instant broadcast when a new item is posted. Stay connected to the campus grid.";
  }
  if (msg.includes('help') || msg.includes('how')) {
    return "AIDA: Use Home to scan active posts, Post to create a report, My Items to manage your own posts, and watch for live alerts.";
  }
  return "AIDA: Signal received. Describe if it is LOST or FOUND, and I will guide you through posting or searching the network.";
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { text: "NEURAL LINK ESTABLISHED. I am AIDA v3.0. How can I assist your search in the GIET grid?", sender: 'bot' }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const userContent = input;
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getBotReply(userContent);
      const botMsg = { text: reply, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 700 + Math.random() * 600);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pulse-glow"
        style={{
          ...chatbotStyles.floatingBtn,
          boxShadow: isOpen
            ? `0 0 30px ${colors.neonBlue}`
            : '0 0 15px rgba(0, 212, 255, 0.5)',
          transform: isOpen ? 'scale(1.05)' : 'scale(1.0)'
        }}
      >
        {isOpen ? '✖' : '🤖'}
      </button>

      {isOpen && (
        <div style={chatbotStyles.chatWindow}>
          <div style={chatHeaderStyle}>
            <div style={onlineDot}></div>
            AIDA: NEURAL ASSISTANT
            <div style={scanLine}></div>
          </div>

          <div style={messageAreaStyle}>
            <div style={matrixOverlay}></div>
            {messages.map((m, i) => (
              <div key={i} style={messageBubbleStyle(m.sender)}>
                <span style={{ fontSize: '0.6rem', opacity: 0.5, display: 'block', marginBottom: '4px' }}>
                  {m.sender === 'user' ? 'ACCESS_USER' : 'SYS_AIDA'}
                </span>
                {m.text}
              </div>
            ))}
            {isTyping && <div style={typingStyle}>AIDA is scanning the grid...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div style={inputAreaStyle}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="ENTER COMMAND..."
              style={cyberInputStyle}
            />
            <button onClick={handleSend} style={sendBtnStyle}>🚀</button>
          </div>
        </div>
      )}
    </>
  );
};

const chatHeaderStyle = {
  padding: '15px',
  background: 'linear-gradient(90deg, rgba(0, 212, 255, 0.2), rgba(57, 255, 20, 0.08))',
  color: colors.neonBlue,
  fontSize: '0.8rem',
  fontFamily: 'Orbitron',
  borderBottom: '1px solid rgba(0, 212, 255, 0.3)',
  position: 'relative',
  overflow: 'hidden'
};

const scanLine = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '2px',
  background: 'rgba(0, 212, 255, 0.7)',
  boxShadow: '0 0 12px #00d4ff',
  animation: 'scan 3s infinite linear'
};

const messageAreaStyle = {
  flex: 1,
  padding: '20px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  background: '#000',
  position: 'relative'
};

const matrixOverlay = {
  position: 'absolute',
  inset: 0,
  backgroundImage: 'linear-gradient(rgba(0,255,0,0.08) 1px, transparent 1px)',
  backgroundSize: '100% 3px',
  opacity: 0.25,
  pointerEvents: 'none'
};

const messageBubbleStyle = (sender) => ({
  alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
  background: sender === 'user'
    ? 'rgba(0, 212, 255, 0.18)'
    : 'rgba(255, 255, 255, 0.06)',
  color: sender === 'user' ? colors.neonBlue : '#fff',
  padding: '12px 18px',
  borderRadius: '15px',
  maxWidth: '85%',
  fontSize: '0.85rem',
  border: `1px solid ${sender === 'user'
    ? colors.neonBlue
    : 'rgba(255, 255, 255, 0.18)'}`,
  boxShadow: sender === 'user'
    ? `0 0 12px rgba(0, 212, 255, 0.4)`
    : '0 0 8px rgba(0,0,0,0.6)',
  backdropFilter: 'blur(6px)',
  transition: 'transform 0.2s ease',
});

const onlineDot = {
  width: '8px',
  height: '8px',
  background: colors.neonGreen,
  borderRadius: '50%',
  display: 'inline-block',
  marginRight: '10px'
};

const typingStyle = {
  fontSize: '0.7rem',
  color: colors.neonBlue,
  opacity: 0.7,
  fontFamily: 'Orbitron'
};

const inputAreaStyle = {
  padding: '15px',
  display: 'flex',
  gap: '10px',
  background: '#0a0a0a',
  borderTop: '1px solid rgba(0, 212, 255, 0.25)'
};

const cyberInputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${colors.neonBlue}`,
  color: colors.neonBlue,
  outline: 'none',
  fontSize: '0.8rem'
};

const sendBtnStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.2rem',
  color: colors.neonBlue
};

export default Chatbot;


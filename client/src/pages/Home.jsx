import { useEffect, useState } from 'react';
import api from '../api';
import { io } from 'socket.io-client';
import { colors, containerStyle } from '../styles';
import StartChatButton from '../components/StartChatButton';

const Home = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [comments, setComments] = useState({}); // id->array
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const [newComment, setNewComment] = useState("");

  const categories = ["ALL", "ELECTRONICS", "ID CARDS", "BOOKS", "WALLETS", "OTHERS"];

  useEffect(() => {
    if (Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    api.get('/api/items/all')
      .then(res => setItems(res.data.filter(item => !item.isResolved)))
      .catch(err => console.log(err));

    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
    socket.on('new-item', (item) => {
      if (!item.isResolved) {
    setItems(prev => [item, ...prev]);
    const msg = `📡 NEW SIGNAL: ${item.title} (${item.specialId || 'NO-ID'}) posted.`;
    alert(msg);
    if (Notification.permission === 'granted') {
      new Notification('Lost-Link', { body: msg });
    }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "ALL" || item.category.toUpperCase() === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // comment/report helpers
  const loadComments = async (itemId) => {
    if (showCommentsFor === itemId) {
      setShowCommentsFor(null);
      return;
    }
    try {
      const res = await api.get(`/api/items/${itemId}/comments`);
      setComments(prev => ({ ...prev, [itemId]: res.data }));
      setShowCommentsFor(itemId);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const postComment = async (itemId) => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/api/items/${itemId}/comments`, { text: newComment });
      setComments(prev => ({ ...prev, [itemId]: [...(prev[itemId]||[]), res.data] }));
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment', err);
      alert('Could not post comment');
    }
  };

  const reportItem = async (itemId) => {
    const reason = window.prompt('Please specify reason for reporting this post:');
    if (!reason) return;
    try {
      await api.post(`/api/items/report/${itemId}`, { reason });
      alert('Report submitted. Thank you.');
    } catch (err) {
      console.error('Report failed', err);
      alert('Could not report');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3.5rem', textShadow: `0 0 20px ${colors.neonBlue}`, margin: 0 }}>
          LOST-LINK <span style={{ color: colors.gietGold }}></span>
        </h1>
        <p style={{ letterSpacing: '5px', color: colors.neonBlue, opacity: 0.8 }}>SYSTEM STATUS: SCANNING CAMPUS NETWORK...</p>
      </div>

      {/* 🔍 Futuristic Search & Category Bar */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <input 
          type="text" 
          placeholder="SEARCHING FOR DATA..." 
          style={cyberSearchInput}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              style={{
                ...categoryButtonStyle,
                border: activeCategory === cat ? `2px solid ${colors.neonBlue}` : '1px solid rgba(0,212,255,0.2)',
                background: activeCategory === cat ? 'rgba(0,212,255,0.2)' : 'transparent',
                color: activeCategory === cat ? colors.neonBlue : '#888'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>



      {/* �📱 Full Screen Grid */}
      <div style={gridStyle}>
        {filteredItems.map((item) => (
          <div key={item._id} className="glass-card" style={cardBaseStyle(item.type)}>
            <div style={imageBoxStyle}>
              <img src={item.image || 'https://via.placeholder.com/400x250/000000/00d4ff?text=SIGNAL+LOST'} 
                   style={imgStyle} alt="Lost Link" />
              <div style={badgeStyle(item.type)}>{item.type}</div>
            </div>
            <div style={{ padding: '20px' }}>
              <h3 style={{ color: colors.neonBlue, marginBottom: '5px' }}>
                {item.title}
              </h3>
              <p style={{ color: colors.neonGreen, fontSize: '0.7rem', margin: '2px 0 8px' }}>
                LINK-ID: {item.specialId || 'PENDING'}
              </p>
              <p style={{ color: '#aaa', fontSize: '0.85rem' }}>{item.description}</p>
              

              <div style={footerStyle}>
                <span>{item.userEmail}</span>
              </div>

              {item.postedBy && (
                <div style={{ marginTop: '12px' }}>
                  <StartChatButton userId={item.postedBy._id} userName={item.postedBy.name} />
                </div>
              )}
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button
                  style={{ ...btnBase, background: '#0077cc' }}
                  onClick={() => loadComments(item._id)}
                >
                  {showCommentsFor === item._id ? 'Hide' : 'Comments'}
                </button>
                <button
                  style={{ ...btnBase, background: '#e67e22' }}
                  onClick={() => reportItem(item._id)}
                >Report</button>
              </div>
              {showCommentsFor === item._id && (
                <div style={{ marginTop: '10px', background: '#111', padding: '10px', borderRadius: '8px' }}>
                  <div>
                    {comments[item._id]?.map(c => (
                      <div key={c._id} style={{ marginBottom: '8px' }}>
                        <strong>{c.user?.name || 'Anon'}</strong>: {c.text}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Add comment"
                      style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #444', background:'#222', color:'#fff' }}
                    />
                    <button
                      style={{ ...btnBase, background: '#2ecc71' }}
                      onClick={() => postComment(item._id)}
                    >Send</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Styles for 2056 Add-ons
const cyberSearchInput = { padding: '15px', borderRadius: '10px', border: `1px solid ${colors.neonBlue}`, background: 'rgba(0,0,0,0.8)', color: colors.neonBlue, width: '90%', maxWidth: '500px', textAlign: 'center', fontFamily: 'Orbitron' };
const categoryButtonStyle = { padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', transition: '0.3s', fontFamily: 'Orbitron' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', width: '100%' };
const cardBaseStyle = (type) => ({ border: `1px solid ${type==='found'?colors.neonGreen:colors.neonRed}`, borderRadius: '20px', overflow: 'hidden' });
const imageBoxStyle = { height: '180px', position: 'relative', background: '#000' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const badgeStyle = (type) => ({ position: 'absolute', top: '10px', right: '10px', padding: '4px 10px', borderRadius: '5px', background: type==='found'?colors.neonGreen:colors.neonRed, color: '#000', fontWeight: 'bold', fontSize: '0.7rem' });
const footerStyle = { display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '0.7rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', opacity: 0.6 };

// button base used in comment/report UI
const btnBase = {
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '12px'
};

export default Home;
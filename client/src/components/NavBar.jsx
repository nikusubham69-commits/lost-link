import { Link, useNavigate } from 'react-router-dom';
// Import colors and styles from your styles file
import { colors } from '../styles'; 

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user && user.email === "lostlink11@gmail.com";

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert("SYSTEM LOGOUT: DISCONNECTING...");
    navigate('/login');
  };

  return (
    <nav style={{ 
      padding: '1rem 5%', 
      background: 'rgba(0, 51, 102, 0.9)', // Glassy GIET Blue
      backdropFilter: 'blur(10px)',
      color: 'white', 
      display: 'flex',
      flexWrap: 'wrap', 
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '15px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: `1px solid ${colors.neonBlue || '#00d4ff'}`,
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <img src="/GIET.jpeg" style={{ width: '40px', borderRadius: '50%' }} alt="GIET Logo" />
  <h2 style={{ margin: 0, fontFamily: 'Orbitron' }}>LOST-LINK </h2>
</div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <Link to="/" style={linkStyle}>Home</Link>
        
        {user && (
          <>
            <Link to="/post" style={linkStyle}>Post Item</Link>
            <Link to="/my-items" style={linkStyle}>Dashboard</Link>
            <Link to="/profile" style={linkStyle}>Profile</Link>
            <Link to="/leaderboard" style={linkStyle}>Leaderboard</Link>
            <Link to="/chat" style={{...linkStyle, color: colors.neonBlue || '#00d4ff', borderBottom: '2px solid #00d4ff', paddingBottom: '2px'}}>💬 Chat</Link>
            
            {/* 🌟 CREDIT SCORE BADGE */}
            <div style={pointsBadgeStyle}>
                <span style={{ fontSize: '0.6rem', color: colors.gietGold || '#ffcc00', display: 'block' }}>CREDIT SCORE</span>
                <span style={{ color: colors.neonGreen || '#39ff14', fontWeight: 'bold' }}>
                    {user.points || 0} XP
                </span>
            </div>
          </>
        )}

        {isAdmin && (
          <Link to="/admin" style={{ ...linkStyle, color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '5px 10px', borderRadius: '5px' }}>
            🛡️ ADMIN PANEL
          </Link>
        )}
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '10px',
          marginLeft: '10px'
        }}>
          {user ? (
            <>
              <span style={{ color: colors.neonBlue || '#00d4ff', fontWeight: 'bold', fontSize: '13px' }}>
                ID: {user.name.split(' ')[0].toUpperCase()}
              </span>
              <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle}>Login</Link>
              <Link to="/register" style={{...linkStyle, color: colors.gietGold || '#ffcc00'}}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- Futuristic Styles ---

const linkStyle = { 
  color: 'white', 
  textDecoration: 'none', 
  fontWeight: 'bold', 
  fontSize: '13px',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  transition: '0.3s'
};

const logoutButtonStyle = { 
  background: 'transparent', 
  color: '#ff4d4d', 
  border: '1px solid #ff4d4d', 
  padding: '6px 12px', 
  borderRadius: '4px', 
  cursor: 'pointer', 
  fontSize: '12px',
  fontWeight: 'bold',
  transition: '0.3s'
};

const pointsBadgeStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(0, 212, 255, 0.2)',
  padding: '5px 12px',
  borderRadius: '8px',
  textAlign: 'center',
  minWidth: '80px',
  boxShadow: '0 0 10px rgba(0, 212, 255, 0.1)'
};

export default Navbar;
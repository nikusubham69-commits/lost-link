// src/styles.js - Professional Theme for GIET Lost-Link

export const colors = {
    primary: '#003366',
    secondary: '#ffcc00',
    success: '#2ecc71',
    danger: '#e74c3c',
    dark: '#121212',
    card: '#1e1e1e',
    neonBlue: '#00d4ff',
    neonGreen: '#39ff14',
    neonRed: '#ff0066',
    gietGold: '#ffcc00'
};

export const containerStyle = {
    padding: '40px 5%', 
    maxWidth: '1200px', 
    margin: 'auto',
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box'
};

export const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    background: colors.card,
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    maxWidth: '500px',
    margin: 'auto'
};

export const inputStyle = {
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#2c2c2c',
    color: 'black',
    fontSize: '16px',
    width: '100%',
    boxSizing: 'border-box'
};

export const buttonStyle = {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    background: colors.primary,
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s'
};

export const chatbotStyles = {
    floatingBtn: {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: `linear-gradient(45deg, ${colors.neonBlue}, #005f73)`,
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '24px',
        zIndex: 1000,
        transition: '0.3s'
    },
    chatWindow: {
        position: 'fixed',
        bottom: '100px',
        right: '30px',
        width: '350px',
        height: '450px',
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${colors.neonBlue}`,
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
        overflow: 'hidden'
    }
};
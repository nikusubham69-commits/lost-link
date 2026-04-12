import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { colors, inputStyle, buttonStyle, formStyle, fieldHintStyle } from '../styles';

const makeCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return {
        question: `Solve to verify: ${a} + ${b} = ?`,
        answer: String(a + b)
    };
};

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [captcha, setCaptcha] = useState(makeCaptcha());
    const [captchaInput, setCaptchaInput] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setCaptcha(makeCaptcha());
        setCaptchaInput('');
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (captchaInput.trim() !== captcha.answer) {
            alert('⚠️ HUMAN VERIFICATION FAILED: Captcha incorrect. Try again.');
            setCaptcha(makeCaptcha());
            setCaptchaInput('');
            return;
        }

        try {
            const res = await api.post('/api/auth/login', credentials);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            alert("✅ VIRTUAL IDENTITY VERIFIED: Welcome back, " + res.data.user.name);
            navigate('/');
        } catch (err) {
            alert("🚨 ACCESS DENIED: " + (err.response?.data?.message || "Invalid Credentials"));
            setCaptcha(makeCaptcha());
            setCaptchaInput('');
        }
    };

    return (
        <div style={cyberContainer}>
            {/* Overlay for scanline effect */}
            <div className="scanline"></div>

            <div className="glass-card" style={loginBoxStyle}>
                <div style={headerSection}>
                    <img src="/GIET.jpeg" style={logoStyle} alt="GIET Logo" />
                    <h2 style={{ color: colors.neonBlue, margin: '10px 0', fontSize: '1.5rem' }}>
                        SYSTEM AUTH
                    </h2>
                    <p style={statusText}>STATUS: ENCRYPTION ACTIVE</p>
                </div>
                
                <form onSubmit={handleLogin} style={formStyle}>
                    <div style={inputGroup}>
                        <label style={labelStyle}>Email (login)</label>
                        <input 
                            type="email" 
                            className="readable-input"
                            placeholder="e.g. student@giet.edu" 
                            style={inputStyle} 
                            onChange={(e) => setCredentials({...credentials, email: e.target.value})} 
                            required 
                        />
                        <p style={fieldHintStyle}>Use the same email you registered with.</p>
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Password</label>
                        <input 
                            type="password" 
                            className="readable-input"
                            placeholder="Enter your password" 
                            style={inputStyle} 
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})} 
                            required 
                        />
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Captcha — solve the question below</label>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: '#e8f7ff', fontWeight: 600 }}>
                            {captcha.question}
                        </div>
                        <input 
                            type="text"
                            className="readable-input"
                            placeholder="Type the numeric answer here"
                            style={inputStyle}
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                            required
                        />
                        <p style={fieldHintStyle}>Helps block bots — enter the correct answer, then log in.</p>
                    </div>

                    <button type="submit" style={buttonStyle}>
                        ESTABLISH CONNECTION
                    </button>
                </form>
                
                <div style={footerSection}>
                    <p style={{ margin: 0 }}>AUTHORIZED TERMINAL v2.0.56</p>
                    <p style={{ fontSize: '0.6rem', color: colors.neonBlue }}>SECURED LINK ACCESSED FROM SPACE</p>
                </div>
            </div>
        </div>
    );
};

// --- Futuristic Inline Styles ---

const cyberContainer = {
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url("/GIET!.jpeg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative'
};

const loginBoxStyle = {
    padding: '40px',
    borderRadius: '24px',
    width: '90%',
    maxWidth: '450px',
    animation: 'neonPulse 5s infinite ease-in-out',
    textAlign: 'center',
    border: `1px solid ${colors.neonBlue}44` // Subtle glow border
};

const headerSection = { marginBottom: '30px' };
const logoStyle = { width: '80px', height: '80px', borderRadius: '50%', border: `2px solid ${colors.neonBlue}`, boxShadow: `0 0 15px ${colors.neonBlue}` };
const statusText = { fontSize: '0.7rem', color: colors.neonGreen, letterSpacing: '2px', fontWeight: 'bold' };
const inputGroup = { textAlign: 'left', marginBottom: '15px' };
const labelStyle = { fontSize: '0.82rem', color: '#d4f4ff', marginLeft: '2px', marginBottom: '6px', display: 'block', letterSpacing: '0.5px', fontWeight: 600 };
const footerSection = { marginTop: '30px', fontSize: '0.75rem', opacity: 0.7, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' };

export default Login;
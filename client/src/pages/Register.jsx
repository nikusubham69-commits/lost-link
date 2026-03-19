import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { formStyle, inputStyle, buttonStyle, colors } from '../styles'; 

// server-driven OTP

const Register = () => {
    const [userData, setUserData] = useState({ name: '', email: '', password: '', phone: '' });
    const [otpSent, setOtpSent] = useState(false);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [phoneVerified, setPhoneVerified] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        if (!userData.phone || userData.phone.trim().length < 8) {
            alert('Enter a valid phone number before requesting OTP.');
            return;
        }
        try {
            const res = await api.post('/api/auth/send-otp', { phone: userData.phone });
            setOtpSent(true);
            alert(`OTP sent to ${userData.phone}: ` + (res.data.code || ''));
        } catch (err) {
            console.error(err);
            alert('Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const res = await api.post('/api/auth/verify-otp', { phone: userData.phone, code: otpInput });
            setPhoneVerified(true);
            alert('📡 PHONE LINK VERIFIED: Secure channel established.');
        } catch (err) {
            setPhoneVerified(false);
            alert('⚠️ OTP MISMATCH OR EXPIRED.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!phoneVerified) {
            alert('Please verify your phone number with OTP before enrollment.');
            return;
        }

        try {
            await api.post('/api/auth/register', {...userData, phoneVerified });
            alert("✨ ENROLLMENT SUCCESSFUL: Welcome to the Neural Network, " + userData.name);
            navigate('/login'); 
        } catch (err) {
            alert("🚨 ENROLLMENT FAILED: " + (err.response?.data?.message || "Data mismatch detected"));
        }
    };

    return (
        <div style={cyberContainer}>
            <div className="scanline"></div>

            <div className="glass-card" style={enrollmentBoxStyle}>
                <div style={headerSection}>
                    <img src="/GIET.jpeg" style={logoStyle} alt="GIET Logo" />
                    <h2 style={{ color: colors.neonGreen, margin: '10px 0', fontSize: '1.5rem', fontFamily: 'Orbitron' }}>
                        NEW IDENTITY ENROLLMENT
                    </h2>
                    <p style={statusText}>STATUS: INITIALIZING PROTOCOLS...</p>
                </div>

                <form onSubmit={handleRegister} style={formStyle}>
                    <div style={inputGroup}>
                        <label style={labelStyle}>FULL LEGAL IDENTITY</label>
                        <input 
                            type="text" 
                            placeholder="NAME_REQUIRED" 
                            style={inputStyle} 
                            onChange={(e) => setUserData({...userData, name: e.target.value})} 
                            required 
                        />
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>AUTHORIZED GIET EMAIL</label>
                        <input 
                            type="email" 
                            placeholder="id@giet.edu" 
                            style={inputStyle} 
                            onChange={(e) => setUserData({...userData, email: e.target.value})} 
                            required 
                        />
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>SECURE CONTACT NUMBER</label>
                        <input 
                            type="tel" 
                            placeholder="+91XXXXXXXXXX" 
                            style={inputStyle} 
                            onChange={(e) => setUserData({...userData, phone: e.target.value})} 
                            required 
                        />
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                style={{ ...buttonStyle, padding: '6px 10px', fontSize: '0.7rem' }}
                                onClick={handleSendOtp}
                            >
                                SEND OTP
                            </button>
                            <input
                                type="text"
                                placeholder="ENTER OTP"
                                style={{ ...inputStyle, flex: 1 }}
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value)}
                                disabled={!otpSent}
                            />
                            <button
                                type="button"
                                style={{ ...buttonStyle, padding: '6px 10px', fontSize: '0.7rem', background: phoneVerified ? colors.neonGreen : colors.danger }}
                                onClick={handleVerifyOtp}
                            >
                                VERIFY
                            </button>
                        </div>
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>NEURAL ACCESS KEY (PASSWORD)</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            style={inputStyle} 
                            onChange={(e) => setUserData({...userData, password: e.target.value})} 
                            required 
                        />
                    </div>

                    <button
                        type="submit"
                        style={{...buttonStyle, background: `linear-gradient(45deg, ${colors.neonGreen}, #010d08)`, opacity: phoneVerified ? 1 : 0.6}}
                    >
                        INITIALIZE ACCOUNT
                    </button>
                </form>

                <div style={footerSection}>
                    <p style={{ margin: 0 }}>SECURE CAMPUS ENROLLMENT v2.0.56</p>
                    <p style={{ fontSize: '0.6rem', color: colors.neonGreen }}>ENCRYPTING BIOMETRIC DATA PACKETS...</p>
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

const enrollmentBoxStyle = {
    padding: '40px',
    borderRadius: '24px',
    width: '90%',
    maxWidth: '480px',
    animation: 'neonPulse 5s infinite ease-in-out',
    textAlign: 'center',
    border: `1px solid ${colors.neonGreen}44`
};

const headerSection = { marginBottom: '25px' };
const logoStyle = { width: '70px', height: '70px', borderRadius: '50%', border: `2px solid ${colors.neonGreen}`, boxShadow: `0 0 15px ${colors.neonGreen}` };
const statusText = { fontSize: '0.7rem', color: colors.neonGreen, letterSpacing: '2px', fontWeight: 'bold', opacity: 0.8 };
const inputGroup = { textAlign: 'left', marginBottom: '12px' };
const labelStyle = { fontSize: '0.6rem', color: colors.neonGreen, marginLeft: '5px', marginBottom: '5px', display: 'block', letterSpacing: '1px', fontFamily: 'Orbitron' };
const footerSection = { marginTop: '25px', fontSize: '0.7rem', opacity: 0.6, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' };

export default Register;
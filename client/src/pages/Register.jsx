import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { formStyle, inputStyle, buttonStyle, colors, fieldHintStyle } from '../styles';

const Register = () => {
    const [userData, setUserData] = useState({ name: '', email: '', password: '', phone: '' });
    const [otpSent, setOtpSent] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [otpSending, setOtpSending] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        if (!userData.phone || userData.phone.trim().length < 8) {
            alert('Enter a valid mobile number first (at least 10 digits).');
            return;
        }
        setOtpSending(true);
        try {
            await api.post('/api/auth/send-otp', { phone: userData.phone.trim() });
            setOtpSent(true);
            setPhoneVerified(false);
            alert('OTP has been sent to your phone. Check your SMS.');
        } catch (err) {
            alert(err.response?.data?.message || 'Could not send OTP. Configure Twilio on the server.');
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpInput.trim()) {
            alert('Type the 6-digit code you received by SMS.');
            return;
        }
        setOtpVerifying(true);
        try {
            const res = await api.post('/api/auth/verify-otp', {
                phone: userData.phone.trim(),
                otp: otpInput.trim(),
            });
            if (res.data?.success) {
                setPhoneVerified(true);
                alert('Phone verified. Enter your password below and create your account.');
            }
        } catch (err) {
            setPhoneVerified(false);
            alert(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setOtpVerifying(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!phoneVerified) {
            alert('Verify the OTP sent to your phone first.');
            return;
        }

        try {
            await api.post('/api/auth/register', userData);
            alert('✨ Registration successful: ' + userData.name);
            navigate('/login');
        } catch (err) {
            alert('🚨 Error: ' + (err.response?.data?.message || 'Check your details and try again.'));
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
                        <label style={labelStyle}>Full name</label>
                        <input
                            type="text"
                            className="readable-input"
                            placeholder="e.g. Rahul Kumar"
                            style={inputStyle}
                            value={userData.name}
                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                            required
                        />
                        <p style={fieldHintStyle}>Use the name you go by on campus.</p>
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>GIET college email</label>
                        <input
                            type="email"
                            className="readable-input"
                            placeholder="example@giet.edu"
                            style={inputStyle}
                            value={userData.email}
                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                            required
                        />
                        <p style={fieldHintStyle}>You will use this email to log in.</p>
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Mobile number (OTP will be sent here)</label>
                        <input
                            type="tel"
                            className="readable-input"
                            placeholder="9876543210 or +919876543210"
                            style={inputStyle}
                            value={userData.phone}
                            onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                            required
                        />
                        <p style={fieldHintStyle}>
                            Enter 10 digits; the system adds +91 for India. You will receive the OTP by SMS.
                        </p>
                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                disabled={otpSending}
                                style={{ ...buttonStyle, padding: '8px 12px', fontSize: '0.8rem' }}
                                onClick={handleSendOtp}
                            >
                                {otpSending ? 'Sending…' : 'SEND OTP (SMS)'}
                            </button>
                            <input
                                type="text"
                                inputMode="numeric"
                                className="readable-input"
                                placeholder="6-digit OTP"
                                style={{ ...inputStyle, flex: '1 1 140px', minWidth: '120px' }}
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value)}
                                disabled={!otpSent}
                            />
                            <button
                                type="button"
                                disabled={otpVerifying || !otpSent}
                                style={{
                                    ...buttonStyle,
                                    padding: '8px 12px',
                                    fontSize: '0.8rem',
                                    background: phoneVerified ? colors.neonGreen : colors.danger,
                                }}
                                onClick={handleVerifyOtp}
                            >
                                {otpVerifying ? '…' : 'VERIFY'}
                            </button>
                        </div>
                        {phoneVerified && (
                            <p style={{ ...fieldHintStyle, color: colors.neonGreen, marginTop: '8px' }}>
                                ✓ Phone verified — enter password and register below.
                            </p>
                        )}
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Password (at least 6 characters)</label>
                        <input
                            type="password"
                            className="readable-input"
                            placeholder="Choose a strong password"
                            style={inputStyle}
                            value={userData.password}
                            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            ...buttonStyle,
                            background: `linear-gradient(45deg, ${colors.neonGreen}, #010d08)`,
                            opacity: phoneVerified ? 1 : 0.55,
                        }}
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

const cyberContainer = {
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url("/GIET!.jpeg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
    position: 'relative',
    padding: '24px 0',
};

const enrollmentBoxStyle = {
    padding: '40px',
    borderRadius: '24px',
    width: '90%',
    maxWidth: '520px',
    animation: 'neonPulse 5s infinite ease-in-out',
    textAlign: 'center',
    border: `1px solid ${colors.neonGreen}44`,
};

const headerSection = { marginBottom: '25px' };
const logoStyle = {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    border: `2px solid ${colors.neonGreen}`,
    boxShadow: `0 0 15px ${colors.neonGreen}`,
};
const statusText = {
    fontSize: '0.75rem',
    color: colors.neonGreen,
    letterSpacing: '2px',
    fontWeight: 'bold',
    opacity: 0.9,
};
const inputGroup = { textAlign: 'left', marginBottom: '14px' };
const labelStyle = {
    fontSize: '0.82rem',
    color: '#d4f4ff',
    marginLeft: '2px',
    marginBottom: '6px',
    display: 'block',
    letterSpacing: '0.5px',
    fontWeight: 600,
};
const footerSection = {
    marginTop: '25px',
    fontSize: '0.7rem',
    opacity: 0.65,
    borderTop: '1px solid rgba(255,255,255,0.12)',
    paddingTop: '15px',
};

export default Register;

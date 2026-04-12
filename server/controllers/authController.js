const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilioPkg = require('twilio');

const OTP_TTL_MS = 10 * 60 * 1000;
const VERIFY_TTL_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

const otpByPhone = new Map();
const verifiedPhoneUntil = new Map();
const lastOtpSentAt = new Map();

function normalizeToE164(raw) {
    const trimmed = String(raw || '').trim();
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 10) return '+91' + digits;
    if (digits.length === 12 && digits.startsWith('91')) return '+' + digits;
    if (trimmed.startsWith('+') && digits.length >= 10) return '+' + digits;
    if (digits.length >= 10 && digits.length <= 15) return '+' + digits;
    return null;
}

function generateOtpCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function getTwilioClient() {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) return null;
    return twilioPkg(sid, token);
}

exports.sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        const e164 = normalizeToE164(phone);
        if (!e164) {
            return res.status(400).json({ message: 'Valid phone number required (10 digits or +91…).' });
        }

        const fromNumber = process.env.TWILIO_PHONE_NUMBER;
        const twilioClient = getTwilioClient();
        if (!twilioClient || !fromNumber) {
            return res.status(503).json({
                message:
                    'SMS is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to server/.env',
            });
        }

        const now = Date.now();
        const last = lastOtpSentAt.get(e164) || 0;
        if (now - last < RESEND_COOLDOWN_MS) {
            const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - last)) / 1000);
            return res.status(429).json({ message: `Please wait ${waitSec}s before requesting another OTP.` });
        }

        const code = generateOtpCode();
        otpByPhone.set(e164, { code, expiresAt: now + OTP_TTL_MS });
        lastOtpSentAt.set(e164, now);

        await twilioClient.messages.create({
            body: `LOST-LINK GIET: Your verification code is ${code}. Valid for 10 minutes. Do not share this code.`,
            from: fromNumber,
            to: e164,
        });

        return res.json({ message: 'OTP sent to your phone number.' });
    } catch (err) {
        console.error('sendOtp error:', err.message);
        return res.status(500).json({
            message: err.message || 'Failed to send SMS. Check Twilio credentials and trial verified numbers.',
        });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const e164 = normalizeToE164(phone);
        if (!e164 || !otp) {
            return res.status(400).json({ message: 'Phone and OTP are required.' });
        }

        const record = otpByPhone.get(e164);
        if (!record || Date.now() > record.expiresAt) {
            otpByPhone.delete(e164);
            return res.status(400).json({ message: 'OTP expired or not found. Request a new OTP.' });
        }

        if (String(otp).trim() !== record.code) {
            return res.status(400).json({ message: 'Invalid OTP. Try again.' });
        }

        otpByPhone.delete(e164);
        verifiedPhoneUntil.set(e164, Date.now() + VERIFY_TTL_MS);

        return res.json({ success: true, message: 'Phone verified.' });
    } catch (err) {
        console.error('verifyOtp error:', err);
        return res.status(500).json({ message: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const e164 = normalizeToE164(phone);
        if (!e164) {
            return res.status(400).json({ message: 'Valid phone number required.' });
        }

        const until = verifiedPhoneUntil.get(e164);
        if (!until || Date.now() > until) {
            return res.status(400).json({ message: 'Phone not verified. Complete OTP verification first.' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone: e164,
            phoneVerified: true,
        });

        verifiedPhoneUntil.delete(e164);

        res.status(201).json({ message: 'Registration successful!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

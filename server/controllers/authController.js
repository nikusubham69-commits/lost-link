const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// in-memory OTP store for demo
const otps = {}; // key: phone or email, value: code

function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // For demo purposes, allow registration without phone verification
        // In production, you should require phoneVerified: true

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || '',
            phoneVerified: false, // Set to false for demo
            role: 'user' // Force user role on registration
        });

        // Generate token for immediate login after registration
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            message: "Registration successful!",
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role || 'user',
                points: user.points || 0 
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// send OTP (demo)
exports.sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone required' });
        const code = generateOtp();
        otps[phone] = { code, expires: Date.now() + 1000 * 60 * 5 };
        console.log('OTP for', phone, code);
        res.json({ message: 'OTP sent', code });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// verify OTP
exports.verifyOtp = async (req, res) => {
    try {
        const { phone, code } = req.body;
        const record = otps[phone];
        if (!record) return res.status(400).json({ message: 'No OTP request found' });
        if (record.expires < Date.now()) return res.status(400).json({ message: 'OTP expired' });
        if (record.code !== code) return res.status(400).json({ message: 'Invalid code' });
        delete otps[phone];
        res.json({ message: 'Verified' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔐 Login attempt:', { email, password: '***' });
        
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({ message: "Email and password required" });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('❌ Password mismatch');
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log('✅ Login successful:', email);
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role || 'user', 
                points: user.points || 0 
            } 
        });
    } catch (err) {
        console.error('❌ Login error:', err.message);
        res.status(500).json({ message: err.message });
    }
};
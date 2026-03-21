const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// in-memory OTP store for demo
const otps = {}; // key: phone, value: { code, expires, verified }

function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate verified phone
        if (!otps[phone] || !otps[phone].verified) {
            return res.status(400).json({ message: "Phone number not verified via OTP" });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone: phone,
            phoneVerified: true,
            role: 'user'
        });

        // Cleanup OTP
        delete otps[phone];

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

// send OTP
exports.sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone required' });
        
        // Validate Indian phone format (+91 followed by 10 digits)
        const phoneRegex = /^\+91[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Invalid format. Use +91XXXXXXXXXX' });
        }

        const code = generateOtp();
        otps[phone] = { 
            code, 
            expires: Date.now() + 1000 * 60 * 5,
            verified: false 
        };
        
        console.log('--- 🛡️ OTP DISPATCHED ---');
        console.log('TARGET:', phone);
        console.log('CODE:', code);
        console.log('------------------------');
        
        res.json({ message: 'OTP sent successfully (Check server logs for demo)', code }); // code returned for demo
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// verify OTP
exports.verifyOtp = async (req, res) => {
    try {
        const { phone, code } = req.body;
        const record = otps[phone];
        
        if (!record) return res.status(400).json({ message: 'No OTP request found for this number' });
        if (record.expires < Date.now()) return res.status(400).json({ message: 'OTP expired' });
        if (record.code !== code) return res.status(400).json({ message: 'Invalid verification code' });
        
        otps[phone].verified = true;
        res.json({ message: 'Phone number verified successfully' });
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
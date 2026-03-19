const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
        const updates = {};
        const { name, phone, password } = req.body;
        if (name) updates.name = name;
        if (phone) updates.phone = phone;
        if (password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }
        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// leaderboard: top 10 by points
exports.leaderboard = async (req, res) => {
    try {
        const top = await User.find().sort({ points: -1 }).limit(10).select('name points');
        res.json(top);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

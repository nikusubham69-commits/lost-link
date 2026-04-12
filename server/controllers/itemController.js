const Item = require('../models/Item.js');
const sendEmail = require('../utils/sendEmail.js');

function generateSpecialId() {
    const part = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ts = Date.now().toString(36).toUpperCase().slice(-4);
    return `LL-${ts}-${part}`;
}

async function createUniqueSpecialId() {
    let id;
    // Try a few times to avoid rare collisions
    for (let i = 0; i < 5; i++) {
        id = generateSpecialId();
        const exists = await Item.findOne({ specialId: id }).lean();
        if (!exists) return id;
    }
    return id;
}

exports.createItem = async (req, res) => {
    try {
        const { title, description, category, type } = req.body;
        
        const itemData = {
            ...req.body,
            image: req.file ? req.file.path : null,
            specialId: await createUniqueSpecialId()
        };
        const newItem = await Item.create(itemData);

        if (type === 'found') {
            const potentialMatches = await Item.find({
                type: 'lost',
                category: category,
                isResolved: false
            });

            potentialMatches.forEach(match => {
                sendEmail(
                    match.userEmail, 
                    "Update from Lost-Link GIET", 
                    `A new ${category} was found matching your lost post: ${title}. Check the portal!`
                );
            });
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('new-item', newItem);
        }

        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getItems = async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        await item.deleteOne();
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// server/controllers/itemController.js

exports.resolveItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        // If already resolved, no extra points
        if (item.isResolved) return res.status(400).json({ message: "Already resolved" });

        // 1. Mark item as resolved
        item.isResolved = true;
        await item.save();

        // 2. Reward finder with points (only for 'found' type items)
        if (item.type === 'found') {
            const User = require('../models/User');
            await User.findOneAndUpdate(
                { email: item.userEmail }, 
                { $inc: { points: 50 } } // +50 reward points
            );
        }

        res.status(200).json({ message: "REWARD CREDITED: +50 GIET Points!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

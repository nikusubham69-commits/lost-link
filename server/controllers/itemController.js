const Item = require('../models/Item.js');
const sendEmail = require('../utils/sendEmail.js');
const cloudinary = require('cloudinary').v2;

function generateSpecialId() {
    const part = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ts = Date.now().toString(36).toUpperCase().slice(-4);
    return `LL-${ts}-${part}`;
}

async function createUniqueSpecialId() {
    let id;
    for (let i = 0; i < 5; i++) {
        id = generateSpecialId();
        const exists = await Item.findOne({ specialId: id }).lean();
        if (!exists) return id;
    }
    return id;
}

exports.createItem = async (req, res) => {
    try {
        const user = req.user;
        const { title, description, category, type, status, latitude, longitude, address, images } = req.body;
        
        let imageUrl = null;
        const itemType = type || status;

        if (!itemType) {
            return res.status(400).json({ message: 'Item type (lost/found) is required' });
        }

        // Handle image upload (base64 or file)
        if (images && Array.isArray(images) && images.length > 0) {
            try {
                const result = await cloudinary.uploader.upload(images[0], {
                    folder: 'lost-link-items',
                });
                imageUrl = result.secure_url;
            } catch (err) {
                console.error('Cloudinary base64 upload error:', err);
                return res.status(400).json({ message: 'Error uploading image to Cloudinary' });
            }
        } else if (req.file) {
            imageUrl = req.file.path;
        }

        const itemData = {
            title,
            description,
            category,
            type: itemType,
            location: {
                type: 'Point',
                coordinates: [Number(longitude) || 0, Number(latitude) || 0],
                address: address || 'UNKNOWN'
            },
            postedBy: user ? user.id : null,
            userEmail: user ? user.email : 'unknown@giet.edu', 
            image: imageUrl,
            specialId: await createUniqueSpecialId()
        };

        const newItem = await Item.create(itemData);

        // Notify matching posts
        const oppositeType = itemType === 'lost' ? 'found' : 'lost';
        const potentialMatches = await Item.find({
            type: oppositeType,
            category: category,
            isResolved: false
        });

        potentialMatches.forEach(match => {
            sendEmail(
                match.userEmail, 
                "Update from Lost-Link GIET", 
                `A new ${category} was ${itemType} matching your post: ${title}. Check the portal!`
            );
        });

        const io = req.app.get('io');
        if (io) {
            const populated = await newItem.populate('postedBy', 'name email');
            io.emit('new-item', populated);
        }

        res.status(201).json(newItem);
    } catch (error) {
        console.error('Create item error:', error);
        res.status(500).json({ message: error.message });
    }
};

// get a single item by id
exports.getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('postedBy', 'name email profilePic');
        if (!item) return res.status(404).json({ message: 'Item not found' });
        
        // for mobile app compatibility, add extra fields
        const itemObj = item.toObject();
        itemObj.reportedBy = itemObj.postedBy;
        itemObj.status = itemObj.type;
        itemObj.images = itemObj.image ? [itemObj.image] : [];
        itemObj.date = itemObj.createdAt;
        
        res.json(itemObj);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// get all items with filters
exports.getItems = async (req, res) => {
    try {
        // allow filtering by query params: category, type, search, location, specialId
        const { category, type, q, location, specialId } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (type) filter.type = type;
        if (location) filter.location = location;
        if (specialId) filter.specialId = specialId;
        if (q) {
            const regex = new RegExp(q, 'i');
            filter.$or = [ { title: regex }, { description: regex }, { userEmail: regex } ];
        }

        const items = await Item.find(filter).sort({ createdAt: -1 }).populate('postedBy', 'name email profilePic');
        
        // add compatibility fields for mobile app
        const itemsWithAlias = items.map(item => {
            const itemObj = item.toObject();
            itemObj.reportedBy = itemObj.postedBy;
            itemObj.status = itemObj.type; // mobile app expects 'status'
            itemObj.images = itemObj.image ? [itemObj.image] : []; // mobile app expects 'images' array
            itemObj.date = itemObj.createdAt; // mobile app expects 'date'
            return itemObj;
        });
        
        res.status(200).json(itemsWithAlias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// comment and report helpers
const Comment = require('../models/Comment');

// fetch comments for an item
exports.getComments = async (req, res) => {
    try {
        const { id } = req.params; // item id
        const comments = await Comment.find({ item: id }).populate('user', 'name');
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// add a new comment
exports.addComment = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
        const { id } = req.params;
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text required' });
        const comment = await Comment.create({ item: id, user: req.user.id, text });
        const populated = await comment.populate('user', 'name');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// report an item for moderation
exports.reportItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const item = await Item.findById(id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        item.reports.push({ user: req.user ? req.user.id : null, reason });
        await item.save();
        res.json({ message: 'Report submitted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        const user = req.user;
        const isAdmin = user && user.role === 'admin';

        console.log(`🗑️ Delete attempt for item ${item._id} by user ${user?.email} (Admin: ${isAdmin})`);

        // ONLY Admin can delete items
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only administrators can delete items' });
        }

        await item.deleteOne();
        res.status(200).json({ message: "Item deleted successfully (Admin Action)" });
    } catch (err) {
        console.error('❌ Delete Error:', err.message);
        res.status(500).json({ message: err.message });
    }
};

// server/controllers/itemController.js

// get items posted by current user
exports.getMyItems = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
        const items = await Item.find({ postedBy: req.user.id }).sort({ createdAt: -1 }).populate('postedBy', 'name email');
        // compatibility fields
        const formattedItems = items.map(item => {
            const itemObj = item.toObject();
            itemObj.status = itemObj.type;
            itemObj.images = itemObj.image ? [itemObj.image] : [];
            itemObj.date = itemObj.createdAt;
            return itemObj;
        });

        res.json(formattedItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// update an item (only owner)
exports.updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        if (item.postedBy && item.postedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

        const { title, description, category, type, location } = req.body;
        if (title) item.title = title;
        if (description) item.description = description;
        if (category) item.category = category;
        if (type) item.type = type;
        if (location) item.location = location;
        if (req.file) item.image = req.file.path;

        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resolveItem = async (req, res) => {
    try {
        const user = req.user;
        const isAdmin = user && user.role === 'admin';

        if (!isAdmin) {
            return res.status(403).json({ message: 'Only administrators can resolve items' });
        }

        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        // Agar item pehle se resolved hai toh points dobara nahi milenge
        if (item.isResolved) return res.status(400).json({ message: "Already resolved" });

        // 1. Item ko resolve mark karo
        item.isResolved = true;
        await item.save();

        // 2. 🌟 Finder ko Reward Points do (Sirf agar item 'found' type ka hai)
        if (item.type === 'found') {
            const User = require('../models/User');
            await User.findOneAndUpdate(
                { email: item.userEmail }, 
                { $inc: { points: 50 } } // 50 Points increase karo
            );
        }

        res.status(200).json({ message: "RESOLVED BY ADMIN: +50 GIET Points credited to finder!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

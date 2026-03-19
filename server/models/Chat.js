const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatMessage'
    }
}, { timestamps: true });

// Ensure unique conversation per item between two users
ChatSchema.index({ participants: 1, item: 1 }, { unique: true });

module.exports = mongoose.model('Chat', ChatSchema);
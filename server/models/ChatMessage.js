const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    message: { 
        type: String, 
        required: true,
        trim: true
    },
    read: { 
        type: Boolean, 
        default: false 
    },
    chatId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    }
}, { timestamps: true });

// Index for faster queries
ChatMessageSchema.index({ chatId: 1, createdAt: -1 });
ChatMessageSchema.index({ sender: 1, receiver: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);

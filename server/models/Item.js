const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    }, 
    type: { 
        type: String, 
        enum: ['lost', 'found'], 
        required: true 
    },
    postedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    userEmail: { 
        type: String, 
        required: true 
    }, 
    image: { 
        type: String,
        default: null 
    },
    specialId: {
        type: String,
        unique: true,
        sparse: true
    },
    isResolved: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true }); 

module.exports = mongoose.model('Item', ItemSchema);
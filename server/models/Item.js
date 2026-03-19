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
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0] // [longitude, latitude]
        },
        address: {
            type: String,
            default: 'UNKNOWN'
        }
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
    },
    reports: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            reason: String,
            date: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true }); 

module.exports = mongoose.model('Item', ItemSchema);
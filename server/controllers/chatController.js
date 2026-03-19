const ChatMessage = require('../models/ChatMessage');
const Chat = require('../models/Chat');
const User = require('../models/User');

// Get all conversations for a user
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const chats = await Chat.find({
            participants: { $in: [userId] }
        })
        .populate('participants', 'name email profilePic')
        .populate('item', 'title images status')
        .populate({
            path: 'lastMessage',
            select: 'message createdAt sender'
        })
        .sort({ updatedAt: -1 });

        // Map server model to mobile app interface
        const formattedChats = chats.map(chat => {
            const chatObj = chat.toObject();
            if (chatObj.lastMessage) {
                chatObj.lastMessage.content = chatObj.lastMessage.message;
            }
            return chatObj;
        });

        res.json(formattedChats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new conversation or get existing one
exports.createConversation = async (req, res) => {
    try {
        const { itemId, participantId } = req.body;
        const senderId = req.user.id;

        if (senderId === participantId) {
            return res.status(400).json({ message: 'Communication with self is restricted' });
        }

        // Check if conversation already exists
        let chat = await Chat.findOne({
            item: itemId,
            participants: { $all: [senderId, participantId] }
        });

        if (!chat) {
            chat = await Chat.create({
                item: itemId,
                participants: [senderId, participantId]
            });
        }

        const populated = await chat.populate('participants', 'name email profilePic');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get chat history for a conversation
exports.getChatHistory = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        const messages = await ChatMessage.find({ chatId })
            .populate('sender', 'name email')
            .sort({ createdAt: 1 });

        // Mark messages as read (receiver-side)
        await ChatMessage.updateMany(
            { chatId, sender: { $ne: userId }, read: false },
            { read: true }
        );

        // Format for mobile app
        const formattedMessages = messages.map(msg => {
            const msgObj = msg.toObject();
            msgObj.content = msgObj.message;
            msgObj.sender = msgObj.sender._id; // client expects string ID
            return msgObj;
        });

        res.json(formattedMessages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Send a chat message
exports.sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;
        const senderId = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Neural link not found' });

        const receiverId = chat.participants.find(p => p.toString() !== senderId.toString());

        const chatMessage = await ChatMessage.create({
            sender: senderId,
            receiver: receiverId,
            message: content,
            chatId
        });

        // Update last message in Chat
        chat.lastMessage = chatMessage._id;
        await chat.save();

        const populated = await chatMessage.populate('sender', 'name email');
        
        // Format for mobile app
        const msgObj = populated.toObject();
        msgObj.content = msgObj.message;
        msgObj.sender = msgObj.sender._id;

        res.status(201).json(msgObj);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Unread messages count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await ChatMessage.countDocuments({ 
            receiver: req.user.id, 
            read: false 
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        await Chat.findByIdAndDelete(conversationId);
        await ChatMessage.deleteMany({ chatId: conversationId });
        res.json({ message: 'Conversation purged' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', chatController.getConversations);
router.post('/', chatController.createConversation);
router.get('/:chatId/messages', chatController.getChatHistory);
router.post('/:chatId/messages', chatController.sendMessage);
router.get('/unread-count', chatController.getUnreadCount);
router.delete('/:chatId', chatController.deleteConversation);

module.exports = router;
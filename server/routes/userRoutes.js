const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, leaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.get('/leaderboard', leaderboard);

module.exports = router;
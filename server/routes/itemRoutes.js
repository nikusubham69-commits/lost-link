const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const upload = require('../config/cloudinary'); 
const { protect } = require('../middleware/authMiddleware');

// public list with filters
router.get('/', itemController.getItems);
router.get('/all', itemController.getItems);
router.get('/:id', itemController.getItemById);

// authentication required for anything below
router.post('/', protect, upload.single('image'), itemController.createItem);
router.get('/my-items', protect, itemController.getMyItems);
router.put('/update/:id', protect, upload.single('image'), itemController.updateItem);
router.patch('/:id/resolve', protect, itemController.resolveItem);
router.put('/resolve/:id', protect, itemController.resolveItem); // keep for backward compatibility
router.delete('/delete/:id', protect, itemController.deleteItem);
// comments and reports
router.get('/:id/comments', itemController.getComments);
router.post('/:id/comments', protect, itemController.addComment);
router.post('/report/:id', protect, itemController.reportItem);

module.exports = router;
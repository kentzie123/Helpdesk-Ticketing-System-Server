const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const {
    getAllNotification,
    markNotificationAsRead,
    deleteNotification,
    clearAllNotifications,
    markAllAsRead
} = require('../controllers/notificationController');

router.put('/notifications/mark-all-as-read', verifyToken, markAllAsRead);
router.delete('/notifications/clear-all', verifyToken, clearAllNotifications);
router.get('/notifications', verifyToken, getAllNotification);
router.patch('/notifications/:notificationId', verifyToken, markNotificationAsRead);
router.delete('/notifications/:notificationId', verifyToken, deleteNotification);


module.exports = router;
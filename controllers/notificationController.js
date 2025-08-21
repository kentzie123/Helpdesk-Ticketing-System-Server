const Notification = require('../models/notification');


const getAllNotification = async (req, res) => {
  const userId = req.user.userID;
  if (!userId) {
    return res.status(400).json({ error: 'No userId found' });
  }

  try {
    const notifications = await Notification.find({ receiverUserId: userId })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error while fetching notifications.' });
  }
};

const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findOne({ notificationId });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.status = 'Read';
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Server error while marking notification as read' });
  }
};


const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findOneAndDelete({ notificationId });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Server error while deleting notification' });
  }
};

const markAllAsRead = async (req, res) => { 
  const { userID: userId } = req.user;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required in URL parameters.' });
  }

  try {
    const result = await Notification.updateMany(
      { receiverUserId: userId, status: 'Unread' },
      { $set: { status: 'Read' } }
    );

    res.status(200).json({
      message: `Marked ${result.modifiedCount} notifications as read.`,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Server error while marking all as read' });
  }
};

const clearAllNotifications = async (req, res) => {
  const { userID: userId } = req.user;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required in URL parameters.' });
  }

  try {
    const result = await Notification.deleteMany({ receiverUserId: userId });

    res.status(200).json({
      message: `Deleted ${result.deletedCount} notifications successfully.`,
    });
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    res.status(500).json({ error: 'Server error while clearing notifications' });
  }
};



module.exports = {
  getAllNotification,
  markNotificationAsRead,
  deleteNotification,
  clearAllNotifications,
  markAllAsRead
};

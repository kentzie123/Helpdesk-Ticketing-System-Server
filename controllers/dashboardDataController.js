const Ticket = require("../models/tickets");
const Notification = require("../models/notification");


// Count tickets by field (status, priority, category, etc.)
const getTicketFieldCounts = async (req, res) => {
  try {
    const { field } = req.params;
    const { role, fullname, userID } = req.user;

    // Role-based filter
    let match = {};
    switch (parseInt(role)) {
      case 1: // Admin - see all
        break;
      case 2: // Staff - assigned to me or created by me
        match = { $or: [{ assignedTo: fullname }, { ownerUserId: userID }] };
        break;
      case 3: // Client - only own tickets
        match = { ownerUserId: userID };
        break;
      default:
        return res.status(400).json({ error: "Invalid role" });
    }

    const counts = await Ticket.aggregate([
      { $match: match },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    ]);

    const formatted = counts.map((item) => ({
      [field]: item._id,
      count: item.count,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error in getTicketFieldCounts:", err);
    res.status(500).json({ error: `Error fetching ${req.params.field} counts` });
  }
};

// Recent tickets (today only)
const getRecentTickets = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { role, fullname, userID } = req.user;

    let query = {
      createdDate: { $gte: today, $lt: tomorrow },
    };

    // Apply role filter
    switch (parseInt(role)) {
      case 1: // Admin
        break;
      case 2: // Staff
        query.$or = [{ assignedTo: fullname }, { ownerUserId: userID }];
        break;
      case 3: // Client
        query.ownerUserId = userID;
        break;
    }

    const recentTickets = await Ticket.find(query).sort({ createdDate: -1 });

    res.status(200).json(recentTickets);
  } catch (error) {
    console.error("Error in getRecentTickets:", error);
    res.status(500).json({ error: "Server error while fetching recent tickets" });
  }
};

// Recent activity (notifications today)
const getRecentActivity = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { role, userID } = req.user;

    let query = {
      createdAt: { $gte: today, $lt: tomorrow },
    };

    // Role filter for notifications
    switch (parseInt(role)) {
      case 1: // Admin - all notifications
        break;
      case 2: // Staff - only those assigned to me
        query.receiverUserId = userID;
        break;
      case 3: // Client - only my tickets’ notifications
        query.receiverUserId = userID;
        break;
    }

    const recentNotifications = await Notification.find(query).sort({ createdAt: -1 });

    res.status(200).json(recentNotifications);
  } catch (error) {
    console.error("Error in getRecentActivity:", error);
    res.status(500).json({ error: "Server error while fetching notifications" });
  }
};

module.exports = {
  getTicketFieldCounts,
  getRecentTickets,
  getRecentActivity,
};

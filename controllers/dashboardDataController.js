const Ticket = require("../models/tickets");
const Notification = require("../models/notification");

/********************** For charts *******************/

const getTicketFieldCounts = async (req, res) => {
  try {
    const { field } = req.params;
    const counts = await Ticket.aggregate([
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    ]);

    // format to { status: "Open", count: 10 }
    const formatted = counts.map((item) => ({
      [field]: item._id,
      count: item.count,
    }));

    res.json(formatted);
  } catch (err) {
    res
      .status(500)
      .json({ error: `Error fetching ${req.params.field} counts` });
  }
};

/*****************************************************/

const getRecentTickets = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tommorow = new Date(today);
    tommorow.setDate(tommorow.getDate() + 1);

    const recentTickets = await Ticket.find({
      createdDate: {
        $gte: today,
        $lt: tommorow,
      },
    });

    res.status(200).json(recentTickets);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server error while fetching the recent tickets" });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tommorow = new Date(today);
    tommorow.setDate(tommorow.getDate() + 1);

    const recentNotifications = await Notification.find({
      createdAt: {
        $gte: today,
        $lt: tommorow,
      },
    });

    res.status(200).json(recentNotifications);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server error while fetching the recent notifications" });
  }
};

module.exports = {
  getTicketFieldCounts,
  getRecentTickets,
  getRecentActivity,
};

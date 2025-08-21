// Models
const Ticket = require("../models/tickets");
const Notification = require("../models/notification");

// utils
const generateTicketId = require("../utils/generateTicketId");

const generateNotificationId = () => {
  const prefix = "NTF";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${timestamp}-${random}`;
};

// GET ticket by ID
const getTicketById = async (req, res) => {
  const ticketId = req.params.ticketId;

  try {
    const ticket = await Ticket.findOne({ ticketId: ticketId });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching the ticket" });
  }
};

const getTicketsByRole = async (req, res) => {
  const { role, fullname, userID } = req.user;

  try {
    let tickets = [];

    switch (parseInt(role)) {
      case 1: // Admin
        tickets = await Ticket.find({});
        break;

      case 2: // Staff
        tickets = await Ticket.find({
          $or: [{ assignedTo: fullname }, { ownerUserId: userID }],
        });
        break;

      case 3: // Client
        tickets = await Ticket.find({ ownerUserId: userID });
        break;

      default:
        return res.status(400).json({ error: "Invalid role" });
    }

    res.status(200).json(tickets);
  } catch (err) {
    console.error("Error fetching tickets by role:", err);
    res.status(500).json({ error: "Server error while fetching tickets" });
  }
};

// Create a new ticket
const createTicket = async (req, res) => {
  const ticketIdGenerated = generateTicketId();
  const { profilePic: ownerPic, fullname: ownerName, userID: ownerUserId } = req.user;

  const {
    subject,
    priority,
    category,
    description,
    assignedTo,
    targetResolveDate,
  } = req.body;

  if (!subject || !priority || !category || !targetResolveDate) {
    return res
      .status(400)
      .json({ error: "Please fill in all required fields." });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const resolveDate = new Date(targetResolveDate);
  resolveDate.setHours(0, 0, 0, 0);

  if (resolveDate < today) {
    return res
      .status(400)
      .json({ error: "Target resolve date cannot be in the past." });
  }

  try {
    const newTicket = new Ticket({
      ticketId: ticketIdGenerated,
      ownerPic,
      ownerName,
      ownerUserId,
      subject,
      priority,
      category,
      description,
      assignedTo: assignedTo.fullname,
      targetResolveDate,
    });

    await newTicket.save();

    if (assignedTo) {
      const newNotification = new Notification({
        notificationId: generateNotificationId(),
        receiverUserId: assignedTo.userID,
        ticketId: ticketIdGenerated,
        title: "New Ticket Assigned",
        message: `A new ticket (${ticketIdGenerated}) has been assigned to you.`,
        status: "Unread",
        createdBy: ownerName,
        type: "Ticket Assignment",
      });

      await newNotification.save();
    }

    res.status(201).json("Created ticket successfully");
  } catch (err) {
    console.error("Create ticket error:", err);
    res.status(500).json({ error: "Server error while creating ticket" });
  }
};

// Update a ticket
const updateTicket = async (req, res) => {
  const { ticketId } = req.params;
  const modifiedBy = req.user.fullname;
  const updateFields = req.body;
  updateFields.modifiedBy = modifiedBy;

  try {
    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (updateFields.targetResolveDate) {
      const updatedResolveDate = new Date(updateFields.targetResolveDate);
      const originalResolveDate = new Date(ticket.targetResolveDate);

      if (updatedResolveDate < originalResolveDate) {
        return res.status(400).json({
          error: "Target resolve date cannot be earlier than the original.",
        });
      }
    }

    updateFields.lastModifiedDate = new Date();

    await Ticket.findOneAndUpdate({ ticketId }, updateFields, { new: true });

    // Notify the ticket owner
    const ticketUpdatedNotification = new Notification({
      notificationId: generateNotificationId(),
      receiverUserId: ticket.ownerUserId,
      ticketId: ticket.ticketId,
      title: "Your Ticket Has Been Updated",
      message: `Your ticket (${ticket.ticketId}) is now ${
        updateFields.status || ticket.status
      }.`,
      status: "Unread",
      createdBy: ticket.assignedTo,
      type: "Ticket Update",
    });

    await ticketUpdatedNotification.save();

    res.status(200).json("Ticket updated successfully");
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Server error while updating the ticket" });
  }
};

const deleteTicket = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const deletedTicket = await Ticket.findOneAndDelete({ ticketId });

    if (!deletedTicket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error while deleting ticket" });
  }
};

const deleteSelectedTickets = async (req, res) => {
  const { ticketIds } = req.body;
  console.log(ticketIds);

  if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
    return res.status(400).json({ error: "Invalid ticket IDs provided" });
  }

  try {
    const result = await Ticket.deleteMany({ _id: { $in: ticketIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "No tickets found to delete" });
    }

    res
      .status(200)
      .json({ message: `${result.deletedCount} tickets deleted successfully` });
  } catch (err) {
    console.error("Error deleting tickets:", err);
    res.status(500).json({ error: "Server error while deleting tickets" });
  }
};

module.exports = {
  getTicketById,
  createTicket,
  deleteTicket,
  updateTicket,
  getTicketsByRole,
  deleteSelectedTickets,
};

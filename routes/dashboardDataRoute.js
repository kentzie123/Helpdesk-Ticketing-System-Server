const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

const {
  getTicketFieldCounts,
  getRecentTickets,
  getRecentActivity
} = require("../controllers/dashboardDataController");

router.get("/ticket-counts/:field", verifyToken, getTicketFieldCounts);
router.get("/recent-tickets", verifyToken, getRecentTickets);
router.get("/recent-notifications", verifyToken, getRecentActivity);

module.exports = router;

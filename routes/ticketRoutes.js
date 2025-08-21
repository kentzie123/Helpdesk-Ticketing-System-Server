const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/requireRoleVerifyToken');
const verifyToken = require('../middleware/verifyToken');


const {
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketsByRole,
  deleteSelectedTickets,
  sayHi
} = require('../controllers/ticketController');

// Routes
router.get('/tickets/by-role', verifyToken, getTicketsByRole);
router.get('/tickets/:ticketId', verifyToken, getTicketById);
router.post('/tickets', verifyToken, createTicket);
router.delete('/tickets/bulk-delete', verifyToken, deleteSelectedTickets); // this go first before /delete/:ticketId because :ticketId might think bulk-delete is an ticketId
router.delete('/tickets/:ticketId', verifyToken, deleteTicket);
router.patch('/tickets/:ticketId', verifyToken, updateTicket);


module.exports = router;

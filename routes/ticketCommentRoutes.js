const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const {
    createTicketComment,
    getTicketComments,
    deleteTicketComment
} = require('../controllers/ticketCommentController');

router.post('/ticket-comments', verifyToken, createTicketComment);
router.get('/ticket-comments/:ticketId', verifyToken, getTicketComments);
router.delete('/ticket-comments/:commentId', verifyToken, deleteTicketComment);

module.exports = router;
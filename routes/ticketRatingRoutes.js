const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const {
    createTicketRating,
    getTicketRatingsByTicketId,
    deleteTicketRating
} = require('../controllers/ticketRatingController');

router.post('/ticket-ratings', verifyToken, createTicketRating);
router.get('/ticket-ratings/:ticketId', verifyToken, getTicketRatingsByTicketId);
router.delete('/ticket-ratings/:ratingId', verifyToken, deleteTicketRating);

module.exports = router;
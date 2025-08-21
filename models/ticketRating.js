const mongoose = require('mongoose');

const TicketRatingSchema = new mongoose.Schema({
    ticketId: {type: String, required: true},
    userId: { type: String },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: { type: String, default: ''},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TicketRating', TicketRatingSchema);
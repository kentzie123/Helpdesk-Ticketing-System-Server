const mongoose = require('mongoose');

const TicketCommentSchema = new mongoose.Schema({
    ticketId:{ type: String, required: true},
    userId: { type: String, required: true },
    fullname: { type: String, required: true},
    comment: { type: String, required: true},
}, {timestamps: true});

module.exports = mongoose.model('TicketComments', TicketCommentSchema);
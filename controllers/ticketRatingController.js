const { create } = require('../models/articleRating');
const TicketRating = require('../models/ticketRating');

const createTicketRating = async (req, res) => {
    const { ticketId, rating, comment } = req.body;
    const { userID: userId } = req.user;

    if (!userId || !ticketId || !rating) {
        return res.status(400).json({ error: "User ID, Ticket ID, and Rating are required" });
    }  

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    try {
        
        const ticketRating = await TicketRating({
            userId,
            ticketId,
            rating,
            comment
        });
        await ticketRating.save();
        return res.status(200).json({ message: 'Rating submitted successfully' });
    } catch (err) {
        onsole.error("Error creating ticket rating:", err);
        return res.status(500).json({ error: "Server error" });
    }
}

const getTicketRatingsByTicketId = async (req, res) => {
    const { ticketId } = req.params;
    try {
        const latestRating = await TicketRating.findOne({ ticketId }).sort({ createdAt: -1 });

        return res.status(200).json(latestRating);
    } catch (err) {
        console.error("Error fetching ticket rating:", err);
        return res.status(500).json({ message: "Server error" });
    }
};


const deleteTicketRating = async (req, res) => {
    const { ratingId } = req.params;

    try {
        const rating = await TicketRating.findByIdAndDelete(ratingId);
        if (!rating) {
            return res.status(404).json({ message: 'Rating not found' });
        }
        return res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (err) {
        console.error("Error deleting ticket rating:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    createTicketRating,
    getTicketRatingsByTicketId,
    deleteTicketRating
}
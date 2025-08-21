const mongoose = require('mongoose');

const ArticleRatingSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  userID: { type: String },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ArticleRating', ArticleRatingSchema);

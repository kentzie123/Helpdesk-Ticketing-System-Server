const mongoose = require('mongoose');

const ArticleViewsSchema = new mongoose.Schema({
    articleId: { type: String },
    userId: { type: String },
    viewedAt: { type: Date , default: Date.now }
})

module.exports = mongoose.model('ArticleViews', ArticleViewsSchema);
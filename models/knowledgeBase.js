const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },

  description: { type: String },

  author: {
    name: { type: String, required: true },
    profilePic: { type: String },
    role: { type: String }
  },

  views: { type: Number, default: 0 },

  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },

  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  content: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', ArticleSchema);

const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');


const {
    createArticleRating,
    getUserArticleRating
} = require('../controllers/articleRatingController');


router.post('/article-ratings', verifyToken, createArticleRating);
router.get('/article-ratings/:articleId', verifyToken, getUserArticleRating);

module.exports = router;

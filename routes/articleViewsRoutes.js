const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const {
    createArticleView
} = require('../controllers/articleViewsController');


// router.get('/article-views/:userID/:article_id', checkAlreadyViewed);

router.post('/article-views', verifyToken, createArticleView);

module.exports = router;

const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/requireRoleVerifyToken');
const verifyToken = require('../middleware/verifyToken');

const {
  getAllArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} = require('../controllers/knowledgeBaseController');

router.get('/knowledge-base', verifyToken, getAllArticles);
router.get('/knowledge-base/:slug', verifyToken, getArticleBySlug);
router.post('/knowledge-base', requireRole(1,2), createArticle);
router.put('/knowledge-base/:slug', requireRole(1,2), updateArticle);
router.delete('/knowledge-base/:slug', requireRole(1,2), deleteArticle);
module.exports = router;

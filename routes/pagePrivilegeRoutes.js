const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const { getPagePrivilegeByRoleId } = require('../controllers/pagePrivilegeController');

router.get('/page-privilege', verifyToken, getPagePrivilegeByRoleId);

module.exports = router;
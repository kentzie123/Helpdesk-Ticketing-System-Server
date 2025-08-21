const express = require('express');
const router = express.Router();

const {
    generateConfirmationCode,
    verifyCode,
    checkPasswordResetAccess
} = require('../controllers/confirmationCodeController');

router.post('/request-code', generateConfirmationCode);
router.post('/verify-code', verifyCode);
router.post('/reset-password', checkPasswordResetAccess);

module.exports = router;
const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/requireRoleVerifyToken');
const verifyToken = require('../middleware/verifyToken');

const { getAllUsers, 
        SignUpCreateUser, 
        updateUser, 
        deleteUser, 
        signUpGenerateConfirmationCode,
        createUser,
        getUserById
    } = require('../controllers/userController');
 
    // NOTE: require param (1 = Admin, 2 = Staff, 3 = Client)

router.post('/signup/generate-code', signUpGenerateConfirmationCode);
router.post('/signup/create-account', SignUpCreateUser);
router.post('/users/create-user', requireRole(1), createUser);
router.get('/users', verifyToken, getAllUsers);
router.get('/users/:id', requireRole(1), getUserById);
router.patch('/users/:id', requireRole(1), updateUser); 
router.delete('/users/:id', requireRole(1), deleteUser);

module.exports = router;
    
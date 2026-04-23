const express = require('express');
const router = express.Router();
const { login, getMe, createUser, promoteUser, deleteUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// Public
router.post('/login', login);

// Protected
router.get('/me', protect, getMe);

// Manager & Super Manager can create users (what role they can assign differs — controlled in controller)
router.post('/create-user', protect, checkRole('manager', 'super_manager'), createUser);

// Manager can promote to developer/lead; Super Manager can promote to any role (enforced in controller)
router.put('/promote/:id', protect, checkRole('manager', 'super_manager'), promoteUser);

// Only Super Manager can delete accounts
router.delete('/users/:id', protect, checkRole('super_manager'), deleteUser);

module.exports = router;

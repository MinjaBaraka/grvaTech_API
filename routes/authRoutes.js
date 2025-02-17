const express = require('express');
const { register, login, logout, updateProfile, getProfile } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

router.post('/register', [
    body('username').trim().isLength({ min: 3 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
    body('role').optional().isIn(['user', 'admin'])
], register);

router.post('/login', login);
router.post('/logout', protect, logout);

// Protected route example
router.get('/profile', protect, getProfile);

// Admin only route example
router.get('/admin-dashboard', protect, restrictTo('admin'), (req, res) => {
    res.json({ message: 'Welcome to admin dashboard' });
});

// Profile routes
router.put('/profile', protect, [
    body('username').optional().trim().isLength({ min: 3 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('phoneNumber').optional().trim(),
    body('currentPassword').optional().isLength({ min: 6 }),
    body('newPassword').optional().isLength({ min: 6 })
], updateProfile);

module.exports = router; 
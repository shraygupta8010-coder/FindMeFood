// backend/routes/userRoutes.js
const express = require('express');
const { 
  getUserProfile, 
  updateUserProfile,
  changePassword
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getUserProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateUserProfile);

// @route   PUT /api/user/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', changePassword);

module.exports = router;
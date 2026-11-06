const express = require('express');
const { 
  createDonation, 
  getAllDonations, 
  updateDonationStatus, 
  getDonationHistory, 
  getMyDonations,
  uploadDonationImage,
  verifyFoodImage,
  detectFoodFromCamera, // ADD THIS IMPORT
  debugDonation
} = require('../controllers/donationController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../services/imageUploadService');

const router = express.Router();

// @route   GET /api/donations/debug
// @desc    Debug donation creation
// @access  Private
router.get('/debug', authMiddleware, debugDonation);

// @route   POST /api/donations/debug
// @desc    Debug donation creation
// @access  Private
router.post('/debug', authMiddleware, debugDonation);

// @route   POST /api/donations/upload-image
// @desc    Upload donation image (Protected)
// @access  Private
router.post('/upload-image', authMiddleware, upload.single('image'), uploadDonationImage);

// @route   POST /api/donations/verify-food
// @desc    Verify food images using AI (Protected)
// @access  Private
router.post('/verify-food', authMiddleware, upload.single('image'), verifyFoodImage);

// @route   POST /api/donations/detect-food
// @desc    Detect food from camera using AI (NEW)
// @access  Private
router.post('/detect-food', authMiddleware, upload.single('image'), detectFoodFromCamera);

// @route   POST /api/donations
// @desc    Create new donation (Protected - users only)
// @access  Private
router.post('/', authMiddleware, createDonation);

// @route   GET /api/donations
// @desc    Get all donations (Public - NGOs can view)
// @access  Public
router.get('/', getAllDonations);

// @route   GET /api/donations/my-donations
// @desc    Get user's donations (Protected - users only)
// @access  Private
router.get('/my-donations', authMiddleware, getMyDonations);

// @route   PUT /api/donations/:id/status
// @desc    Update donation status (Protected - NGOs only)
// @access  Private
router.put('/:id/status', authMiddleware, updateDonationStatus);

// @route   GET /api/donations/:id/history
// @desc    Get donation status history (Protected)
// @access  Private
router.get('/:id/history', authMiddleware, getDonationHistory);

module.exports = router;
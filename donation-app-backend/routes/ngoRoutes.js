const express = require('express');
const { 
  registerNGO, 
  getAllNGOs, 
  getNGODonations, 
  getNGOStats, 
  updateNGOProfile,
  getNearbyNGOs,
  getRealNearbyNGOs  // Add this import
} = require('../controllers/ngoController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/ngo/register
// @desc    Register new NGO
// @access  Public
router.post('/register', registerNGO);

// @route   GET /api/ngo
// @desc    Get all NGOs
// @access  Public
router.get('/', getAllNGOs);

// @route   GET /api/ngo/nearby
// @desc    Find nearby NGOs by location
// @access  Public
router.get('/nearby', getNearbyNGOs);

// @route   GET /api/ngo/nearby/real
// @desc    Find real NGOs using enhanced service (OpenStreetMap + Database)
// @access  Public
router.get('/nearby/real', getRealNearbyNGOs);  // Add this route

// @route   GET /api/ngo/dashboard/donations
// @desc    Get donations assigned to NGO (Protected - NGOs only)
// @access  Private
router.get('/dashboard/donations', authMiddleware, getNGODonations);

// @route   GET /api/ngo/dashboard/stats
// @desc    Get NGO dashboard statistics (Protected - NGOs only)
// @access  Private
router.get('/dashboard/stats', authMiddleware, getNGOStats);

// @route   PUT /api/ngo/dashboard/profile
// @desc    Update NGO profile (Protected - NGOs only)
// @access  Private
router.put('/dashboard/profile', authMiddleware, updateNGOProfile);

module.exports = router;
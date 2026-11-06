// backend/routes/aadhaarRoutes.js
const express = require('express');
const {
  uploadAadhaarImages,
  getAadhaarStatus,
  verifyAadhaar,
  getPendingVerifications
} = require('../controllers/aadhaarController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../services/imageUploadService');

const router = express.Router();

// Configure multer for multiple files
const aadhaarUpload = upload.fields([
  { name: 'front', maxCount: 1 },
  { name: 'back', maxCount: 1 }
]);

// @route   POST /api/aadhaar/upload
// @desc    Upload Aadhaar card images
// @access  Private
router.post('/upload', authMiddleware, aadhaarUpload, uploadAadhaarImages);

// @route   GET /api/aadhaar/status
// @desc    Get Aadhaar verification status
// @access  Private
router.get('/status', authMiddleware, getAadhaarStatus);

// @route   POST /api/aadhaar/verify/:userId
// @desc    Verify Aadhaar
// @access  Private
router.post('/verify/:userId', authMiddleware, verifyAadhaar);

// @route   GET /api/aadhaar/pending
// @desc    Get pending Aadhaar verifications
// @access  Private
router.get('/pending', authMiddleware, getPendingVerifications);

module.exports = router;
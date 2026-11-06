const express = require('express');
const { 
  registerUser, 
  loginUser, 
  verifyOTP,
  resendOTP
} = require('../controllers/authController');
const { 
  validateUserRegistration, 
  validateLogin,
  validateOTPVerification
} = require('../middleware/validationMiddleware');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', validateUserRegistration, registerUser);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP
// @access  Public
router.post('/verify-otp', validateOTPVerification, verifyOTP);

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP
// @access  Public
router.post('/resend-otp', validateOTPVerification, resendOTP);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, loginUser);

module.exports = router;
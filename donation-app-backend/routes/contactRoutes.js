// backend/routes/contactRoutes.js
const express = require('express');
const { submitContact, getContactMessages } = require('../controllers/contactController');

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', submitContact);

// @route   GET /api/contact/messages
// @desc    Get all contact messages (admin only)
// @access  Private
router.get('/messages', getContactMessages);

module.exports = router;
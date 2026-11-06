// backend/controllers/contactController.js
const pool = require('../config/database');
const { sendContactConfirmationEmail, sendAdminNotificationEmail } = require('../services/emailService');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Insert contact message into database
    const result = await pool.query(
      `INSERT INTO contact_messages (name, email, subject, message, category, status) 
       VALUES (?, ?, ?, ?, ?, 'new')`,
      [name, email, subject, message, category || 'general']
    );

    // Get the last inserted ID
    const lastIdResult = await pool.query('SELECT last_insert_rowid() as id');
    const messageId = lastIdResult.rows[0].id;

    // Send confirmation email to user
    await sendContactConfirmationEmail(email, name, subject, messageId);

    // Send notification to admin
    await sendAdminNotificationEmail(name, email, subject, message, category);

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        messageId: messageId,
        ticketNumber: `FMF-${messageId.toString().padStart(6, '0')}`
      }
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting contact form',
      error: error.message
    });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact/messages
// @access  Private (Admin only)
const getContactMessages = async (req, res) => {
  try {
    const messages = await pool.query(
      `SELECT * FROM contact_messages 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      message: 'Contact messages fetched successfully',
      data: {
        messages: messages.rows
      }
    });

  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching contact messages',
      error: error.message
    });
  }
};

module.exports = {
  submitContact,
  getContactMessages
};
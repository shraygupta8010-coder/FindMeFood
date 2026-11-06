const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

// Email validation function
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// @desc    Register new user WITHOUT OTP verification
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { email, password, phone, full_name, address, aadhaar_number } = req.body;

    // 1. Validate required fields
    if (!email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and phone number are required'
      });
    }

    // 2. Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // 3. Validate phone number (10 digits for India)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit phone number'
      });
    }

    // 4. Validate Aadhaar number (12 digits) if provided
    if (aadhaar_number && !/^\d{12}$/.test(aadhaar_number)) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar number must be 12 digits'
      });
    }

    // 5. Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = ? OR phone = ? OR aadhaar_number = ?',
      [email, phone, aadhaar_number]
    );

    if (userExists.rows.length > 0) {
      const existingUser = userExists.rows[0];
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this phone number'
        });
      }
      if (aadhaar_number && existingUser.aadhaar_number === aadhaar_number) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this Aadhaar number'
        });
      }
    }

    // 6. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      // 7. Insert into users table - AUTO VERIFIED (is_verified = 1, no OTP)
      const userResult = await pool.query(
        `INSERT INTO users (email, phone, password, is_verified, otp, otp_expiry, aadhaar_number, aadhaar_verification_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [email, phone, hashedPassword, 1, null, null, aadhaar_number || null, aadhaar_number ? 'pending' : 'not_provided']
      );

      // Get the last inserted ID
      const lastIdResult = await pool.query('SELECT last_insert_rowid() as id');
      const userId = lastIdResult.rows[0].id;

      // 8. Insert into user_profiles table WITH ADDRESS
      await pool.query(
        `INSERT INTO user_profiles (user_id, full_name, phone, address, city, state, pincode) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          full_name || null, 
          phone,
          // Handle both string and object address formats
          typeof address === 'string' ? address : 
          address?.street || address || '',
          typeof address === 'object' ? address?.city || '' : '',
          typeof address === 'object' ? address?.state || '' : '',
          typeof address === 'object' ? address?.pincode || '' : ''
        ]
      );

      // 9. If Aadhaar provided, create verification record
      if (aadhaar_number) {
        await pool.query(
          `INSERT INTO aadhaar_verifications (user_id, aadhaar_number, verification_status) 
           VALUES (?, ?, 'pending')`,
          [userId, aadhaar_number]
        );
      }

      // 10. Create JWT token for immediate login
      const token = jwt.sign(
        { userId: userId, email: email, phone: phone },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '30d' }
      );

      // 11. Send welcome email
      if (email) {
        await sendWelcomeEmail(email, full_name || 'User');
      }

      console.log(`✅ USER REGISTERED & AUTO-VERIFIED: ${email}`);
      console.log(`📍 Address received:`, address);

      // 12. Return success response WITH TOKEN for immediate login
      res.status(201).json({
        success: true,
        message: 'Registration successful! You are now logged in.',
        data: {
          user: {
            id: userId,
            email: email,
            phone: phone,
            full_name: full_name || null,
            aadhaar_number: aadhaar_number || null,
            aadhaar_verified: false,
            aadhaar_verification_status: aadhaar_number ? 'pending' : 'not_provided',
            is_verified: true
          },
          token: token,
          requiresOTP: false // Important: Tell frontend no OTP needed
        }
      });

    } catch (error) {
      console.error('Database insertion error:', error);
      throw error;
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Verify Mobile OTP - KEEP FOR BACKWARD COMPATIBILITY BUT MAKE OPTIONAL
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // If no OTP provided, just return success (for backward compatibility)
    if (!otp) {
      return res.json({
        success: true,
        message: 'OTP verification skipped - user already verified',
        data: {
          user: {
            is_verified: true
          },
          token: null
        }
      });
    }

    // 1. Validate required fields
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // 2. Find user by phone number
    const userResult = await pool.query(
      'SELECT * FROM users WHERE phone = ?',
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this phone number'
      });
    }

    const user = userResult.rows[0];

    // 3. If user already verified, return success
    if (user.is_verified) {
      const token = jwt.sign(
        { userId: user.id, email: user.email, phone: user.phone },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '30d' }
      );

      return res.json({
        success: true,
        message: 'User already verified',
        data: {
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            is_verified: true
          },
          token: token
        }
      });
    }

    // 4. Check if OTP matches (if OTP was provided)
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // 5. Update user as verified and clear OTP fields
    await pool.query(
      'UPDATE users SET is_verified = 1, otp = NULL, otp_expiry = NULL WHERE id = ?',
      [user.id]
    );

    // 6. Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, phone: user.phone },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '30d' }
    );

    // 7. Return success response
    res.json({
      success: true,
      message: 'Mobile number verified successfully!',
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          is_verified: true
        },
        token: token
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
};

// @desc    Resend Mobile OTP - KEEP FOR BACKWARD COMPATIBILITY
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // 1. Find user by phone number
    const userResult = await pool.query(
      'SELECT * FROM users WHERE phone = ?',
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this phone number'
      });
    }

    const user = userResult.rows[0];

    // 2. Check if already verified
    if (user.is_verified) {
      return res.json({
        success: true,
        message: 'User is already verified',
        requiresOTP: false
      });
    }

    // 3. Return message that OTP is not required
    res.json({
      success: true,
      message: 'OTP verification is not required. User is auto-verified.',
      requiresOTP: false
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // 2. Find user by email with password and verification status
    const userResult = await pool.query(
      `SELECT u.id, u.email, u.phone, u.password, u.is_verified, u.aadhaar_number, u.aadhaar_verification_status, up.full_name 
       FROM users u 
       LEFT JOIN user_profiles up ON u.id = up.user_id 
       WHERE u.email = ?`,
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = userResult.rows[0];
    console.log('✅ User found:', { id: user.id, email: user.email });

    // 3. Check if password exists
    if (!user.password) {
      console.log('❌ No password stored for user');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 4. Verify password
    let isValidPassword = false;
    
    if (user.password.startsWith('$2')) {
      // Bcrypt hash comparison
      isValidPassword = await bcrypt.compare(password, user.password);
      console.log('✅ Bcrypt comparison result:', isValidPassword);
    } else {
      // Plain text comparison (for existing users)
      console.log('⚠️ Comparing plain text passwords');
      isValidPassword = (user.password === password);
      console.log('✅ Plain text comparison result:', isValidPassword);
      
      // If successful, upgrade to bcrypt
      if (isValidPassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
        console.log('✅ Password upgraded to bcrypt');
      }
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 5. REMOVED OTP VERIFICATION CHECK - Users are auto-verified

    // 6. Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '30d' }
    );

    console.log('✅ Login successful for user:', user.id);

    // 7. Return success response with Aadhaar info
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          full_name: user.full_name,
          is_verified: user.is_verified,
          aadhaar_number: user.aadhaar_number,
          aadhaar_verification_status: user.aadhaar_verification_status
        },
        token: token
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP
};
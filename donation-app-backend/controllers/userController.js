// backend/controllers/userController.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log('🔍 Fetching profile for user ID:', userId);

    // First, check if user exists
    const userExists = await pool.query(
      'SELECT id, email FROM users WHERE id = ?',
      [userId]
    );

    if (userExists.rows.length === 0) {
      console.log('❌ User not found with ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User found:', userExists.rows[0]);

    // Check if user_profiles table exists
    try {
      const tableCheck = await pool.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='user_profiles'"
      );
      console.log('✅ user_profiles table exists:', tableCheck.rows.length > 0);
    } catch (tableError) {
      console.log('❌ Error checking user_profiles table:', tableError.message);
    }

    // Get user profile with left join (handles missing profile data)
    const userResult = await pool.query(
      `SELECT u.id, u.email, u.phone, u.is_verified, u.created_at,
              up.full_name, up.address, up.city, up.state, up.pincode
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = ?`,
      [userId]
    );

    console.log('📊 Profile query result:', userResult.rows[0]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const user = userResult.rows[0];

    // If no profile exists, create a default one
    if (!user.full_name && !user.address) {
      console.log('🆕 No profile data found, creating default profile...');
      
      // Insert default profile
      await pool.query(
        `INSERT OR IGNORE INTO user_profiles (user_id, full_name, phone, address, city, state, pincode)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, '', user.phone || '', '', '', '', '']
      );

      // Fetch again
      const updatedResult = await pool.query(
        `SELECT u.id, u.email, u.phone, u.is_verified, u.created_at,
                up.full_name, up.address, up.city, up.state, up.pincode
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         WHERE u.id = ?`,
        [userId]
      );

      const updatedUser = updatedResult.rows[0];
      
      res.json({
        success: true,
        message: 'Profile fetched successfully (default profile created)',
        data: {
          profile: updatedUser
        }
      });
    } else {
      res.json({
        success: true,
        message: 'Profile fetched successfully',
        data: {
          profile: user
        }
      });
    }

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { full_name, phone, address, city, state, pincode } = req.body;

    console.log('🔄 Updating profile for user:', userId, req.body);

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Update users table (phone)
      if (phone !== undefined) {
        await pool.query(
          'UPDATE users SET phone = ? WHERE id = ?',
          [phone, userId]
        );
      }

      // Check if profile exists
      const profileExists = await pool.query(
        'SELECT * FROM user_profiles WHERE user_id = ?',
        [userId]
      );

      if (profileExists.rows.length > 0) {
        // Update existing profile
        await pool.query(
          `UPDATE user_profiles 
           SET full_name = COALESCE(?, full_name), 
               phone = COALESCE(?, phone), 
               address = COALESCE(?, address), 
               city = COALESCE(?, city), 
               state = COALESCE(?, state), 
               pincode = COALESCE(?, pincode)
           WHERE user_id = ?`,
          [full_name, phone, address, city, state, pincode, userId]
        );
      } else {
        // Insert new profile
        await pool.query(
          `INSERT INTO user_profiles (user_id, full_name, phone, address, city, state, pincode)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, full_name || '', phone || '', address || '', city || '', state || '', pincode || '']
        );
      }

      await pool.query('COMMIT');

      // Get updated profile
      const updatedProfile = await pool.query(
        `SELECT u.id, u.email, u.phone, u.is_verified, u.created_at,
                up.full_name, up.address, up.city, up.state, up.pincode
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         WHERE u.id = ?`,
        [userId]
      );

      console.log('✅ Profile updated successfully');

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          profile: updatedProfile.rows[0]
        }
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message
    });
  }
};

// @desc    Change user password
// @route   PUT /api/user/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Get current user with password
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password',
      error: error.message
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword
};
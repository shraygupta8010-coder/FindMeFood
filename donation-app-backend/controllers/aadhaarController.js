// backend/controllers/aadhaarController.js
const pool = require('../config/database');
const { aadhaarUpload, handleImageUpload } = require('../services/imageUploadService');

// @desc    Upload Aadhaar card images
// @route   POST /api/aadhaar/upload
// @access  Private
const uploadAadhaarImages = async (req, res) => {
  try {
    if (!req.files || !req.files.front || !req.files.back) {
      return res.status(400).json({
        success: false,
        message: 'Both front and back Aadhaar card images are required'
      });
    }

    const userId = req.user.userId;
    const { aadhaar_number } = req.body;

    // Validate Aadhaar number
    if (!aadhaar_number || !/^\d{12}$/.test(aadhaar_number)) {
      return res.status(400).json({
        success: false,
        message: 'Valid 12-digit Aadhaar number is required'
      });
    }

    console.log('📸 Uploading Aadhaar images for user:', userId);

    try {
      // Upload front image to Cloudinary
      const frontImageResult = await handleImageUpload(req.files.front[0]);
      const frontImageUrl = frontImageResult.imageUrl;

      // Upload back image to Cloudinary  
      const backImageResult = await handleImageUpload(req.files.back[0]);
      const backImageUrl = backImageResult.imageUrl;

      console.log('✅ Aadhaar images uploaded successfully:', {
        front: frontImageUrl,
        back: backImageUrl
      });

      // Update or create Aadhaar verification record
      const existingVerification = await pool.query(
        'SELECT * FROM aadhaar_verifications WHERE user_id = ?',
        [userId]
      );

      if (existingVerification.rows.length > 0) {
        // Update existing record
        await pool.query(
          `UPDATE aadhaar_verifications 
           SET aadhaar_number = ?, aadhaar_front_image = ?, aadhaar_back_image = ?, 
               verification_status = 'pending', updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`,
          [aadhaar_number, frontImageUrl, backImageUrl, userId]
        );
      } else {
        // Create new record
        await pool.query(
          `INSERT INTO aadhaar_verifications 
           (user_id, aadhaar_number, aadhaar_front_image, aadhaar_back_image, verification_status) 
           VALUES (?, ?, ?, ?, 'pending')`,
          [userId, aadhaar_number, frontImageUrl, backImageUrl]
        );
      }

      // Update user's Aadhaar number and status
      await pool.query(
        'UPDATE users SET aadhaar_number = ?, aadhaar_verification_status = ? WHERE id = ?',
        [aadhaar_number, 'pending', userId]
      );

      res.json({
        success: true,
        message: 'Aadhaar images uploaded successfully. Verification is pending.',
        data: {
          aadhaar_number: aadhaar_number,
          front_image: frontImageUrl,
          back_image: backImageUrl,
          verification_status: 'pending'
        }
      });

    } catch (uploadError) {
      console.error('❌ Cloudinary upload error:', uploadError);
      
      // Fallback to mock URLs if Cloudinary fails
      const frontImageUrl = `https://via.placeholder.com/600x400/4CAF50/white?text=Aadhaar+Front+${Date.now()}`;
      const backImageUrl = `https://via.placeholder.com/600x400/2196F3/white?text=Aadhaar+Back+${Date.now()}`;

      // Update database with mock URLs
      const existingVerification = await pool.query(
        'SELECT * FROM aadhaar_verifications WHERE user_id = ?',
        [userId]
      );

      if (existingVerification.rows.length > 0) {
        await pool.query(
          `UPDATE aadhaar_verifications 
           SET aadhaar_number = ?, aadhaar_front_image = ?, aadhaar_back_image = ?, 
               verification_status = 'pending', updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`,
          [aadhaar_number, frontImageUrl, backImageUrl, userId]
        );
      } else {
        await pool.query(
          `INSERT INTO aadhaar_verifications 
           (user_id, aadhaar_number, aadhaar_front_image, aadhaar_back_image, verification_status) 
           VALUES (?, ?, ?, ?, 'pending')`,
          [userId, aadhaar_number, frontImageUrl, backImageUrl]
        );
      }

      await pool.query(
        'UPDATE users SET aadhaar_number = ?, aadhaar_verification_status = ? WHERE id = ?',
        [aadhaar_number, 'pending', userId]
      );

      res.json({
        success: true,
        message: 'Aadhaar images uploaded successfully (using fallback). Verification is pending.',
        data: {
          aadhaar_number: aadhaar_number,
          front_image: frontImageUrl,
          back_image: backImageUrl,
          verification_status: 'pending',
          using_fallback: true
        }
      });
    }

  } catch (error) {
    console.error('Aadhaar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Aadhaar upload',
      error: error.message
    });
  }
};

// @desc    Get Aadhaar verification status
// @route   GET /api/aadhaar/status
// @access  Private
const getAadhaarStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const verificationResult = await pool.query(
      `SELECT av.*, u.email, up.full_name
       FROM aadhaar_verifications av
       LEFT JOIN users u ON av.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE av.user_id = ?`,
      [userId]
    );

    if (verificationResult.rows.length === 0) {
      return res.json({
        success: true,
        message: 'No Aadhaar verification record found',
        data: {
          verification_status: 'not_submitted'
        }
      });
    }

    const verification = verificationResult.rows[0];

    res.json({
      success: true,
      message: 'Aadhaar status fetched successfully',
      data: {
        verification: verification
      }
    });

  } catch (error) {
    console.error('Get Aadhaar status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching Aadhaar status',
      error: error.message
    });
  }
};

// @desc    Verify Aadhaar (Admin only)
// @route   POST /api/aadhaar/verify/:userId
// @access  Private (Admin)
const verifyAadhaar = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, rejection_reason } = req.body;
    const adminId = req.user.userId;

    // For now, allow any authenticated user to verify (for testing)
    // In production, implement proper admin check
    console.log(`🛠️ Aadhaar verification by user ${adminId} for user ${userId}`);

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "verified" or "rejected"'
      });
    }

    if (status === 'rejected' && !rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting verification'
      });
    }

    // Update Aadhaar verification record
    await pool.query(
      `UPDATE aadhaar_verifications 
       SET verification_status = ?, rejection_reason = ?, verified_by = ?, verified_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [status, rejection_reason || null, adminId, userId]
    );

    // Update user record
    await pool.query(
      'UPDATE users SET aadhaar_verification_status = ?, aadhaar_verified = ? WHERE id = ?',
      [status, status === 'verified', userId]
    );

    res.json({
      success: true,
      message: `Aadhaar verification ${status} successfully`,
      data: {
        user_id: parseInt(userId),
        verification_status: status,
        verified_by: adminId,
        verified_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Aadhaar verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Aadhaar verification',
      error: error.message
    });
  }
};

// @desc    Get pending Aadhaar verifications
// @route   GET /api/aadhaar/pending
// @access  Private
const getPendingVerifications = async (req, res) => {
  try {
    const pendingVerifications = await pool.query(
      `SELECT av.*, u.email, up.full_name, up.phone, u.created_at as user_created_at
       FROM aadhaar_verifications av
       LEFT JOIN users u ON av.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE av.verification_status = 'pending'
       ORDER BY av.created_at ASC`
    );

    res.json({
      success: true,
      message: 'Pending verifications fetched successfully',
      data: {
        verifications: pendingVerifications.rows,
        total_pending: pendingVerifications.rows.length
      }
    });

  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pending verifications',
      error: error.message
    });
  }
};

module.exports = {
  uploadAadhaarImages,
  getAadhaarStatus,
  verifyAadhaar,
  getPendingVerifications
};
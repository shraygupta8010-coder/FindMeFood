const pool = require('../config/database');
const { sendStatusUpdateEmail, sendNewDonationEmail } = require('../services/emailService');
const { upload } = require('../services/imageUploadService');
const foodVerificationService = require('../services/foodVerificationService');

// @desc    Upload donation image
// @route   POST /api/donations/upload-image
// @access  Private
const uploadDonationImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Return the uploaded image URL
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: req.file.path, // Cloudinary URL
        publicId: req.file.filename // Cloudinary public ID
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload',
      error: error.message
    });
  }
};

// @desc    Verify food image using AI
// @route   POST /api/donations/verify-food
// @access  Private
const verifyFoodImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('🔍 Verifying food image with AI...');
    
    const verificationResult = await foodVerificationService.verifyFoodImage(
      req.file.buffer, 
      req.file.originalname
    );

    res.json({
      success: true,
      message: 'Food verification completed',
      data: {
        verification: verificationResult,
        verifiedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Food verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Food verification failed',
      error: error.message
    });
  }
};

// @desc    Detect food from camera using AI (NEW - Camera Detection)
// @route   POST /api/donations/detect-food
// @access  Private
const detectFoodFromCamera = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('📸 AI Food Detection from Camera...');
    
    // Try Google Cloud Vision API first
    const detectionResult = await detectFoodWithGoogleVision(req.file.buffer);
    
    // If Google Vision fails, use our fallback
    if (!detectionResult) {
      console.log('🔄 Using fallback AI detection');
      const fallbackResult = await foodVerificationService.verifyFoodImage(
        req.file.buffer, 
        req.file.originalname
      );
      
      return res.json({
        success: true,
        message: 'Food detection completed',
        data: {
          ...fallbackResult,
          source: 'fallback_ai',
          camera_detection: true
        }
      });
    }

    res.json({
      success: true,
      message: 'Food detection completed',
      data: {
        ...detectionResult,
        source: 'google_vision',
        camera_detection: true
      }
    });

  } catch (error) {
    console.error('Food detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Food detection failed',
      error: error.message
    });
  }
};

// Google Cloud Vision Detection (NEW)
async function detectFoodWithGoogleVision(imageBuffer) {
  try {
    // Check if Google Cloud Vision is available
    try {
      const vision = require('@google-cloud/vision');
      const client = new vision.ImageAnnotatorClient();
      
      // Detect labels (objects) in the image
      const [result] = await client.labelDetection({
        image: { content: imageBuffer.toString('base64') }
      });
      
      const labels = result.labelAnnotations || [];
      
      // Food-related labels from Google Vision
      const foodLabels = [
        'food', 'dish', 'meal', 'cuisine', 'fruit', 'vegetable',
        'bread', 'meat', 'dessert', 'snack', 'breakfast', 'lunch',
        'dinner', 'restaurant', 'cooking', 'recipe', 'ingredient',
        'pizza', 'burger', 'sandwich', 'salad', 'soup', 'rice',
        'pasta', 'noodle', 'chicken', 'fish', 'egg', 'cheese',
        'milk', 'yogurt', 'coffee', 'tea', 'juice', 'water'
      ];
      
      // Check if any food labels are detected
      const foodDetected = labels.some(label => 
        foodLabels.some(foodLabel => 
          label.description.toLowerCase().includes(foodLabel.toLowerCase())
        )
      );
      
      // Get confidence score
      const confidence = labels.length > 0 ? labels[0].score || 0.7 : 0.5;
      
      // Get top 5 detected items
      const detectedItems = labels.slice(0, 5).map(label => label.description);
      
      // Determine food type
      const foodType = determineFoodType(labels);
      
      return {
        isFood: foodDetected,
        confidence: confidence,
        foodType: foodType,
        items: detectedItems,
        labels: labels.map(l => ({ description: l.description, score: l.score })),
        message: foodDetected ? `✅ Detected: ${foodType}` : '❌ No food detected',
        quality: assessFoodQuality(confidence, detectedItems)
      };
      
    } catch (visionError) {
      console.log('Google Vision not available, using fallback:', visionError.message);
      return null;
    }
    
  } catch (error) {
    console.error('Google Vision error:', error);
    return null;
  }
}

function determineFoodType(labels) {
  const labelDescriptions = labels.map(l => l.description.toLowerCase());
  
  if (labelDescriptions.some(d => d.includes('fruit'))) return 'Fresh Fruits';
  if (labelDescriptions.some(d => d.includes('vegetable') || d.includes('salad'))) return 'Fresh Vegetables';
  if (labelDescriptions.some(d => d.includes('bread') || d.includes('bakery'))) return 'Bakery Items';
  if (labelDescriptions.some(d => d.includes('meat') || d.includes('chicken') || d.includes('fish'))) return 'Meat/Protein';
  if (labelDescriptions.some(d => d.includes('dessert') || d.includes('cake') || d.includes('sweet'))) return 'Dessert';
  if (labelDescriptions.some(d => d.includes('cooked') || d.includes('meal') || d.includes('curry'))) return 'Cooked Meal';
  if (labelDescriptions.some(d => d.includes('packaged') || d.includes('canned') || d.includes('bottled'))) return 'Packaged Food';
  if (labelDescriptions.some(d => d.includes('dairy') || d.includes('milk') || d.includes('cheese'))) return 'Dairy Products';
  
  return 'Various Food Items';
}

function assessFoodQuality(confidence, items) {
  if (confidence > 0.8) return 'excellent';
  if (confidence > 0.6) return 'good';
  if (confidence > 0.4) return 'fair';
  return 'poor';
}

// @desc    Create new donation
// @route   POST /api/donations
// @access  Private (users only)
const createDonation = async (req, res) => {
  try {
    const { food_type, food_image_url, food_source, location, verification_data, contact_info, selected_ngo_id } = req.body;
    const user_id = req.user.userId; // From auth middleware

    // 1. Validate required fields
    if (!food_type || !location) {
      return res.status(400).json({
        success: false,
        message: 'Food type and location are required'
      });
    }

    // 2. If NGO is selected, verify it exists and get details
    let selectedNGO = null;
    if (selected_ngo_id) {
      // FIXED: Use n.email instead of np.email
      const ngoResult = await pool.query(
        `SELECT n.*, np.contact_person, np.phone, n.email as contact_email 
         FROM ngo n 
         JOIN ngo_profiles np ON n.id = np.ngo_id 
         WHERE n.id = ?`,
        [selected_ngo_id]
      );

      if (ngoResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Selected NGO not found'
        });
      }
      selectedNGO = ngoResult.rows[0];
      console.log(`✅ NGO selected: ${selectedNGO.name} (ID: ${selectedNGO.id})`);
    }

    // 3. Insert donation with NGO assignment
    const donationResult = await pool.query(
      `INSERT INTO donations (user_id, food_type, food_image_url, food_source, location, status, verification_data, ngo_id) 
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        user_id, 
        food_type, 
        food_image_url || null, 
        food_source || null, 
        JSON.stringify(location),
        verification_data ? JSON.stringify(verification_data) : null,
        selected_ngo_id || null // Assign NGO if selected
      ]
    );

    // 4. Get the last inserted ID
    const donationId = await pool.getLastInsertId();

    // 5. Send notifications based on NGO selection
    if (selected_ngo_id && selectedNGO) {
      // Notify only the selected NGO
      await sendNewDonationEmail(
        selectedNGO.contact_email || selectedNGO.email,
        selectedNGO.name,
        food_type,
        typeof location === 'string' ? location : location.address,
        contact_info
      );
      console.log(`📧 Notification sent to selected NGO: ${selectedNGO.name}`);
    } else {
      // Notify all NGOs (original behavior)
      // FIXED: Use n.email instead of np.email
      const allNGOs = await pool.query(
        'SELECT n.id, n.name, n.email FROM ngo n JOIN ngo_profiles np ON n.id = np.ngo_id WHERE np.verified = 1'
      );
      
      if (allNGOs.rows.length > 0) {
        allNGOs.rows.forEach(async (ngo) => {
          try {
            await sendNewDonationEmail(
              ngo.email,
              ngo.name,
              food_type,
              typeof location === 'string' ? location : location.address,
              contact_info
            );
          } catch (emailError) {
            console.error(`Failed to send email to ${ngo.email}:`, emailError);
          }
        });
        console.log(`📧 Notifications sent to ${allNGOs.rows.length} NGOs`);
      } else {
        console.log('⚠️ No NGOs found to notify');
      }
    }

    // 6. Get donation details with user and NGO info
    const donationDetails = await pool.query(
      `SELECT d.*, u.email as donor_email, up.full_name as donor_name,
              n.name as ngo_name, n.email as ngo_email, np.contact_person as ngo_contact
       FROM donations d
       LEFT JOIN users u ON d.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN ngo n ON d.ngo_id = n.id
       LEFT JOIN ngo_profiles np ON n.id = np.ngo_id
       WHERE d.id = ?`,
      [donationId]
    );

    // 7. Prepare response data
    const responseData = {
      donation: donationDetails.rows[0],
      verification: verification_data ? {
        verified: true,
        message: 'Food verified by AI'
      } : {
        verified: false,
        message: 'No verification data provided'
      }
    };

    // 8. Add NGO assignment info to response
    let successMessage = 'Donation created successfully!';
    
    if (selected_ngo_id && selectedNGO) {
      responseData.assigned_ngo = {
        id: selectedNGO.id,
        name: selectedNGO.name,
        contact_person: selectedNGO.contact_person,
        email: selectedNGO.contact_email || selectedNGO.email,
        phone: selectedNGO.phone
      };
      successMessage = `Donation created successfully! ${selectedNGO.name} has been notified and will contact you soon.`;
    } else {
      successMessage = 'Donation created successfully! All nearby NGOs have been notified.';
    }

    // 9. Return success response
    res.status(201).json({
      success: true,
      message: successMessage,
      data: responseData
    });

  } catch (error) {
    console.error('Donation creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during donation creation',
      error: error.message
    });
  }
};

// @desc    Debug donation creation
// @route   GET /api/donations/debug
// @access  Private
const debugDonation = async (req, res) => {
  try {
    const user_id = req.user.userId;
    
    console.log('🐛 Debug donation - User ID:', user_id);
    
    // Check if user exists
    const userExists = await pool.query(
      'SELECT id, email FROM users WHERE id = ?',
      [user_id]
    );
    
    if (userExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check donations table structure
    const tableInfo = await pool.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='donations'"
    );
    
    res.json({
      success: true,
      message: 'Debug information',
      data: {
        user: userExists.rows[0],
        tables: {
          donations: tableInfo.rows.length > 0 ? 'Exists' : 'Missing'
        },
        serverTime: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Debug donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
};

// @desc    Get all donations (for NGOs to view)
// @route   GET /api/donations
// @access  Public
const getAllDonations = async (req, res) => {
  try {
    const donationsResult = await pool.query(
      `SELECT d.*, u.email as donor_email, up.full_name as donor_name, up.phone as donor_phone,
              n.name as ngo_name
       FROM donations d
       LEFT JOIN users u ON d.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN ngo n ON d.ngo_id = n.id
       ORDER BY d.created_at DESC`
    );

    // Parse verification data for each donation
    const donationsWithVerification = donationsResult.rows.map(donation => {
      let verificationData = null;
      try {
        if (donation.verification_data) {
          verificationData = JSON.parse(donation.verification_data);
        }
      } catch (error) {
        console.error('Error parsing verification data:', error);
      }
      
      return {
        ...donation,
        verification_data: verificationData
      };
    });

    res.json({
      success: true,
      message: 'Donations fetched successfully',
      data: {
        donations: donationsWithVerification
      }
    });

  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching donations',
      error: error.message
    });
  }
};

// @desc    Update donation status (NGO accepts/completes donation)
// @route   PUT /api/donations/:id/status
// @access  Private (NGOs only)
const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const changed_by = req.user.userId; // NGO user ID

    // 1. Validate status
    const validStatuses = ['pending', 'accepted', 'picked_up', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, accepted, picked_up, completed, or cancelled'
      });
    }

    // 2. Check if donation exists
    const donationExists = await pool.query(
      'SELECT * FROM donations WHERE id = ?',
      [id]
    );

    if (donationExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    const donation = donationExists.rows[0];

    // 3. Update donation status
    await pool.query(
      'UPDATE donations SET status = ?, ngo_id = ? WHERE id = ?',
      [status, changed_by, id]
    );

    // 4. Log status change in history
    await pool.query(
      'INSERT INTO donation_status_history (donation_id, status, changed_by, notes) VALUES (?, ?, ?, ?)',
      [id, status, changed_by, notes || null]
    );

    // 5. Send email notification to donor about status change
    const donorInfo = await pool.query(
      `SELECT u.email, up.full_name, n.name as ngo_name 
       FROM donations d
       LEFT JOIN users u ON d.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN ngo n ON d.ngo_id = n.id
       WHERE d.id = ?`,
      [id]
    );

    if (donorInfo.rows.length > 0 && donorInfo.rows[0].email) {
      const donor = donorInfo.rows[0];
      await sendStatusUpdateEmail(
        donor.email,
        donor.full_name,
        donation.food_type,
        donation.status, // old status
        status, // new status
        donor.ngo_name
      );
    }

    // 6. Return success response
    res.json({
      success: true,
      message: `Donation status updated to ${status}`,
      data: {
        donation: {
          id: parseInt(id),
          status: status,
          ngo_id: changed_by
        }
      }
    });

  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating donation status',
      error: error.message
    });
  }
};

// @desc    Get donation status history
// @route   GET /api/donations/:id/history
// @access  Private
const getDonationHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const historyResult = await pool.query(
      `SELECT dsh.*, u.email as changed_by_email, up.full_name as changed_by_name
       FROM donation_status_history dsh
       LEFT JOIN users u ON dsh.changed_by = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE dsh.donation_id = ?
       ORDER BY dsh.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      message: 'Donation history fetched successfully',
      data: {
        history: historyResult.rows
      }
    });

  } catch (error) {
    console.error('Get donation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching donation history',
      error: error.message
    });
  }
};

// @desc    Get user's donations
// @route   GET /api/donations/my-donations
// @access  Private (users only)
const getMyDonations = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const donationsResult = await pool.query(
      `SELECT d.*, n.name as ngo_name, n.email as ngo_email
       FROM donations d
       LEFT JOIN ngo n ON d.ngo_id = n.id
       WHERE d.user_id = ?
       ORDER BY d.created_at DESC`,
      [user_id]
    );

    // Parse verification data for user's donations
    const donationsWithVerification = donationsResult.rows.map(donation => {
      let verificationData = null;
      try {
        if (donation.verification_data) {
          verificationData = JSON.parse(donation.verification_data);
        }
      } catch (error) {
        console.error('Error parsing verification data:', error);
      }
      
      return {
        ...donation,
        verification_data: verificationData
      };
    });

    res.json({
      success: true,
      message: 'User donations fetched successfully',
      data: {
        donations: donationsWithVerification
      }
    });

  } catch (error) {
    console.error('Get user donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user donations',
      error: error.message
    });
  }
};

module.exports = {
  createDonation,
  getAllDonations,
  updateDonationStatus,
  getDonationHistory,
  getMyDonations,
  uploadDonationImage,
  verifyFoodImage,
  detectFoodFromCamera, // NEW: Add this export
  debugDonation
};
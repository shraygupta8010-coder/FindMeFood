const pool = require('../config/database');
const enhancedNgoService = require('../services/enhancedNgoService');

// @desc    Register new NGO
// @route   POST /api/ngo/register
// @access  Public
const registerNGO = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      description, 
      address = {},
      contact_person,
      website,
      registration_number
    } = req.body;

    console.log('🏢 NGO Registration attempt:', { name, email });

    // 1. Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // 2. Check if NGO already exists
    const ngoExists = await pool.query(
      'SELECT * FROM ngo WHERE email = ?',
      [email]
    );

    if (ngoExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'NGO already exists with this email'
      });
    }

    // 3. Insert into ngo table
    const ngoResult = await pool.query(
      `INSERT INTO ngo (name, email) 
       VALUES (?, ?)`,
      [name, email]
    );

    // 4. Get the last inserted ID
    const ngoId = await pool.getLastInsertId();

    // 5. Insert into ngo_profiles table WITH LOCATION DATA
    await pool.query(
      `INSERT INTO ngo_profiles (
        ngo_id, description, phone, contact_person, 
        website, registration_number, address,
        latitude, longitude, service_radius
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ngoId, 
        description || null, 
        phone || null,
        contact_person || null,
        website || null,
        registration_number || null,
        address.street ? JSON.stringify(address) : address || null,
        address.latitude || null,
        address.longitude || null,
        20 // CHANGED: Default service radius from 10km to 20km
      ]
    );

    console.log('✅ NGO registered successfully:', ngoId);

    // 6. Return success response
    res.status(201).json({
      success: true,
      message: 'NGO registered successfully',
      data: {
        ngo: {
          id: ngoId,
          name: name,
          email: email,
          phone: phone || null,
          description: description || null,
          contact_person: contact_person || null,
          address: address || null
        }
      }
    });

  } catch (error) {
    console.error('NGO Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during NGO registration',
      error: error.message
    });
  }
};

// @desc    Get all NGOs
// @route   GET /api/ngo
// @access  Public
const getAllNGOs = async (req, res) => {
  try {
    const ngosResult = await pool.query(
      `SELECT n.id, n.name, n.email, np.phone, np.description, np.verified,
             np.latitude, np.longitude, np.address, np.service_radius,
             np.contact_person, np.website
       FROM ngo n 
       JOIN ngo_profiles np ON n.id = np.ngo_id`
    );

    // SAFE address parsing for each NGO
    const ngosWithParsedAddress = ngosResult.rows.map(ngo => {
      let parsedAddress = null;
      
      if (ngo.address) {
        try {
          // Try to parse as JSON first
          parsedAddress = JSON.parse(ngo.address);
        } catch (error) {
          // If parsing fails, use as plain string
          parsedAddress = ngo.address;
        }
      }
      
      return {
        ...ngo,
        address: parsedAddress
      };
    });

    res.json({
      success: true,
      message: 'NGOs fetched successfully',
      data: {
        ngos: ngosWithParsedAddress
      }
    });

  } catch (error) {
    console.error('Get NGOs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching NGOs',
      error: error.message
    });
  }
};

// @desc    Find nearby NGOs
// @route   GET /api/ngo/nearby
// @access  Public
const getNearbyNGOs = async (req, res) => {
  try {
    const { latitude, longitude, radius = 20 } = req.query; // CHANGED: radius from 10 to 20km

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    const searchRadius = parseFloat(radius);

    console.log(`📍 Searching NGOs near: ${userLat}, ${userLng} (${searchRadius}km radius)`);

    // Get all NGOs with location
    const ngosResult = await pool.query(`
      SELECT n.id, n.name, n.email, np.phone, np.description, np.verified,
             np.latitude, np.longitude, np.address, np.service_radius,
             np.contact_person, np.website
      FROM ngo n 
      JOIN ngo_profiles np ON n.id = np.ngo_id
      WHERE np.latitude IS NOT NULL AND np.longitude IS NOT NULL
    `);

    console.log(`📊 Found ${ngosResult.rows.length} NGOs with location data`);

    // SAFE address parsing for each NGO
    const ngosWithParsedAddress = ngosResult.rows.map(ngo => {
      let parsedAddress = null;
      
      if (ngo.address) {
        try {
          // Try to parse as JSON first
          parsedAddress = JSON.parse(ngo.address);
        } catch (error) {
          // If parsing fails, use as plain string
          parsedAddress = ngo.address;
        }
      }
      
      return {
        ...ngo,
        address: parsedAddress
      };
    });

    // Calculate distance for each NGO
    const ngosWithDistance = ngosWithParsedAddress.map(ngo => {
      const distance = calculateDistance(userLat, userLng, ngo.latitude, ngo.longitude);
      return {
        ...ngo,
        distance: parseFloat(distance.toFixed(2))
      };
    });

    // Filter NGOs within radius
    const nearbyNGOs = ngosWithDistance
      .filter(ngo => ngo.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    console.log(`✅ Found ${nearbyNGOs.length} NGOs within ${searchRadius}km`);

    res.json({
      success: true,
      message: 'Nearby NGOs fetched successfully',
      data: {
        ngos: nearbyNGOs,
        userLocation: { latitude: userLat, longitude: userLng },
        searchRadius: searchRadius,
        totalFound: nearbyNGOs.length
      }
    });

  } catch (error) {
    console.error('Get nearby NGOs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching nearby NGOs',
      error: error.message
    });
  }
};

// @desc    Find real NGOs using enhanced service (OpenStreetMap + Database)
// @route   GET /api/ngo/nearby/real
// @access  Public
const getRealNearbyNGOs = async (req, res) => {
  try {
    const { latitude, longitude, radius = 20000 } = req.query; // CHANGED: 10000 → 20000 (20km)

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    console.log(`🗺️ Searching real NGOs near: ${latitude}, ${longitude}, radius: ${radius}m`);

    // Get NGOs from enhanced service
    const nearbyNGOs = await enhancedNgoService.findNearbyNGOs(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(radius)
    );

    console.log(`✅ Found ${nearbyNGOs.length} NGOs within ${radius/1000}km radius`);

    res.json({
      success: true,
      message: 'Real NGOs fetched successfully',
      data: {
        ngos: nearbyNGOs,
        userLocation: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        searchRadius: parseInt(radius),
        totalFound: nearbyNGOs.length
      }
    });

  } catch (error) {
    console.error('Get real NGOs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch real NGOs',
      error: error.message
    });
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

// @desc    Get donations assigned to NGO
// @route   GET /api/ngo/dashboard/donations
// @access  Private (NGOs only)
const getNGODonations = async (req, res) => {
  try {
    const ngo_id = req.user.userId; // NGO's user ID

    const donationsResult = await pool.query(
      `SELECT d.*, u.email as donor_email, up.full_name as donor_name, up.phone as donor_phone
       FROM donations d
       LEFT JOIN users u ON d.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE d.ngo_id = ?
       ORDER BY d.created_at DESC`,
      [ngo_id]
    );

    res.json({
      success: true,
      message: 'NGO donations fetched successfully',
      data: {
        donations: donationsResult.rows
      }
    });

  } catch (error) {
    console.error('Get NGO donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching NGO donations',
      error: error.message
    });
  }
};

// @desc    Get NGO dashboard statistics
// @route   GET /api/ngo/dashboard/stats
// @access  Private (NGOs only)
const getNGOStats = async (req, res) => {
  try {
    const ngo_id = req.user.userId;

    // Get counts by status
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_donations,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
       FROM donations 
       WHERE ngo_id = ?`,
      [ngo_id]
    );

    // Get recent activity (last 7 days)
    const recentActivity = await pool.query(
      `SELECT COUNT(*) as recent_donations
       FROM donations 
       WHERE ngo_id = ? AND created_at >= datetime('now', '-7 days')`,
      [ngo_id]
    );

    const stats = statsResult.rows[0];
    const recent = recentActivity.rows[0];

    res.json({
      success: true,
      message: 'NGO stats fetched successfully',
      data: {
        stats: {
          total: stats.total_donations,
          pending: stats.pending_count,
          accepted: stats.accepted_count,
          completed: stats.completed_count,
          cancelled: stats.cancelled_count,
          recent: recent.recent_donations
        }
      }
    });

  } catch (error) {
    console.error('Get NGO stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching NGO stats',
      error: error.message
    });
  }
};

// @desc    Update NGO profile
// @route   PUT /api/ngo/dashboard/profile
// @access  Private (NGOs only)
const updateNGOProfile = async (req, res) => {
  try {
    const ngo_id = req.user.userId;
    const { description, phone, contact_email, address, latitude, longitude } = req.body;

    // Update NGO profile
    await pool.query(
      `UPDATE ngo_profiles 
       SET description = ?, phone = ?, contact_email = ?, address = ?, latitude = ?, longitude = ?
       WHERE ngo_id = ?`,
      [description || null, phone || null, contact_email || null, address ? JSON.stringify(address) : address || null, latitude || null, longitude || null, ngo_id]
    );

    // Get updated profile
    const updatedProfile = await pool.query(
      `SELECT np.*, n.name, n.email
       FROM ngo_profiles np
       LEFT JOIN ngo n ON np.ngo_id = n.id
       WHERE np.ngo_id = ?`,
      [ngo_id]
    );

    res.json({
      success: true,
      message: 'NGO profile updated successfully',
      data: {
        profile: updatedProfile.rows[0]
      }
    });

  } catch (error) {
    console.error('Update NGO profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating NGO profile',
      error: error.message
    });
  }
};

module.exports = {
  registerNGO,
  getAllNGOs,
  getNearbyNGOs,
  getRealNearbyNGOs,
  getNGODonations,
  getNGOStats,
  updateNGOProfile
};
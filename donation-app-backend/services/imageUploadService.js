const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary (using demo credentials for development)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo_secret',
});

// Create storage engine for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'donation_app',
    format: async (req, file) => 'png', // Convert all to png
    public_id: (req, file) => {
      // Generate unique filename with type prefix
      const prefix = req.uploadType || 'donation'; // Use uploadType from request or default
      return `${prefix}_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    },
  },
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer for single file uploads
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Configure multer for multiple files (for Aadhaar front and back)
const aadhaarUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
});

// @desc    Upload image to Cloudinary
// @param   {Buffer} imageBuffer - Image file buffer
// @return  {Object} Upload result with URL
const uploadImage = async (imageBuffer) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'donation_app',
          format: 'png',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(imageBuffer);
    });
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

// @desc    Delete image from Cloudinary
// @param   {string} publicId - Cloudinary public ID
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Image deleted: ${publicId}`);
  } catch (error) {
    console.error('Image deletion error:', error);
    throw error;
  }
};

// Simple file upload handler for temporary/mock uploads
const handleImageUpload = async (file) => {
  try {
    // For now, return a mock URL - we'll implement Cloudinary later
    console.log('📸 Image upload requested:', file.originalname);
    
    return {
      success: true,
      imageUrl: `https://via.placeholder.com/600x400/4CAF50/white?text=${file.originalname}+${Date.now()}`,
      publicId: `mock-${Date.now()}`
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Image upload failed');
  }
};

module.exports = {
  upload,           // For single file uploads
  aadhaarUpload,    // For multiple file uploads (Aadhaar)
  uploadImage,
  deleteImage,
  cloudinary,
  handleImageUpload // For temporary mock uploads
};
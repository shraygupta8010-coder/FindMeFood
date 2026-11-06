// src/components/AadhaarUpload.jsx
import React, { useState } from 'react';
import { aadhaarService } from '../service/aadhaarService';
import './AadhaarUpload.css';

const AadhaarUpload = ({ onUploadComplete, currentAadhaar }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    aadhaar_number: currentAadhaar || '',
    front_image: null,
    back_image: null
  });

  const [preview, setPreview] = useState({
    front: null,
    back: null
  });

  const handleAadhaarChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setFormData(prev => ({ ...prev, aadhaar_number: value }));
    setError('');
  };

  const handleImageUpload = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload only image files');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setFormData(prev => ({ ...prev, [`${side}_image`]: file }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(prev => ({ ...prev, [side]: e.target.result }));
    };
    reader.readAsDataURL(file);
    
    setError('');
  };

  const removeImage = (side) => {
    setFormData(prev => ({ ...prev, [`${side}_image`]: null }));
    setPreview(prev => ({ ...prev, [side]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Validate Aadhaar number
      if (!formData.aadhaar_number || !/^\d{12}$/.test(formData.aadhaar_number)) {
        setError('Please enter a valid 12-digit Aadhaar number');
        setUploading(false);
        return;
      }

      // Validate images
      if (!formData.front_image || !formData.back_image) {
        setError('Please upload both front and back images of your Aadhaar card');
        setUploading(false);
        return;
      }

      console.log('📤 Uploading Aadhaar verification...');

      const result = await aadhaarService.uploadAadhaarImages(
        formData.aadhaar_number,
        formData.front_image,
        formData.back_image
      );

      if (result.success) {
        setSuccess('Aadhaar uploaded successfully! Verification is pending.');
        if (onUploadComplete) {
          onUploadComplete(result.data);
        }
        
        // Reset form after successful upload
        setFormData({
          aadhaar_number: formData.aadhaar_number,
          front_image: null,
          back_image: null
        });
        setPreview({ front: null, back: null });
      } else {
        setError(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Aadhaar upload error:', error);
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="aadhaar-upload">
      <div className="upload-header">
        <h3>🆔 Aadhaar Verification</h3>
        <p>Upload both sides of your Aadhaar card for identity verification</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="upload-form">
        {/* Aadhaar Number Input */}
        <div className="form-group">
          <label>Aadhaar Number *</label>
          <input
            type="text"
            value={formData.aadhaar_number}
            onChange={handleAadhaarChange}
            placeholder="Enter 12-digit Aadhaar number"
            maxLength="12"
            required
          />
          <small className="helper-text">
            We verify your identity to ensure a trusted community
          </small>
        </div>

        {/* Image Upload Sections */}
        <div className="upload-sections">
          {/* Front Side */}
          <div className="upload-section">
            <h4>Front Side</h4>
            <div 
              className={`upload-area ${preview.front ? 'has-image' : ''}`}
              onClick={() => document.getElementById('front-upload').click()}
            >
              {preview.front ? (
                <div className="image-preview">
                  <img src={preview.front} alt="Aadhaar Front" />
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage('front');
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">📷</div>
                  <div className="upload-text">
                    <div>Click to upload front side</div>
                    <small>Photo side with your photo</small>
                  </div>
                </div>
              )}
              <input
                id="front-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'front')}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Back Side */}
          <div className="upload-section">
            <h4>Back Side</h4>
            <div 
              className={`upload-area ${preview.back ? 'has-image' : ''}`}
              onClick={() => document.getElementById('back-upload').click()}
            >
              {preview.back ? (
                <div className="image-preview">
                  <img src={preview.back} alt="Aadhaar Back" />
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage('back');
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">📷</div>
                  <div className="upload-text">
                    <div>Click to upload back side</div>
                    <small>Address side</small>
                  </div>
                </div>
              )}
              <input
                id="back-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'back')}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="security-note">
          <div className="note-icon">🔒</div>
          <div className="note-text">
            <strong>Your data is secure:</strong> Aadhaar images are encrypted and stored securely. 
            They are only used for verification and never shared with third parties.
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn btn-primary btn-full"
          disabled={uploading || !formData.front_image || !formData.back_image || !formData.aadhaar_number}
        >
          {uploading ? (
            <>
              <div className="spinner"></div>
              Uploading...
            </>
          ) : (
            'Submit for Verification'
          )}
        </button>
      </form>
    </div>
  );
};

export default AadhaarUpload;
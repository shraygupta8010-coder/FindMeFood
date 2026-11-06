import React, { useState } from 'react';
import './FoodVerification.css';

const FoodVerification = ({ onVerificationComplete, onBack }) => {
  const [images, setImages] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, analyzing, verified, failed
  const [verificationResult, setVerificationResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Results

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      status: 'pending'
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const startVerification = async () => {
    if (images.length === 0) return;
    
    setVerificationStatus('analyzing');
    
    try {
      // Use the first image for verification
      const imageFile = images[0].file;
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('http://localhost:5000/api/donations/verify-food', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setVerificationResult(result.data.verification);
        setVerificationStatus('verified');
        setCurrentStep(2);
        
        // Pass results to parent
        if (onVerificationComplete) {
          onVerificationComplete(result.data.verification);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationStatus('failed');
    }
  };

  const retryVerification = () => {
    setVerificationStatus('idle');
    setVerificationResult(null);
    setImages([]);
    setCurrentStep(1);
  };

  return (
    <div className="food-verification">
      {/* Step 1: Image Upload */}
      {currentStep === 1 && (
        <div className="verification-step">
          <div className="step-header">
            <h2>📸 Food Verification</h2>
            <p>Upload clear photos of your food for AI analysis</p>
          </div>

          <div className="upload-section">
            <div 
              className="upload-zone"
              onClick={() => document.getElementById('food-upload').click()}
            >
              <div className="upload-icon">📷</div>
              <div className="upload-text">
                <div className="upload-title">Click to upload food images</div>
                <div className="upload-subtitle">Supports JPG, PNG • Max 5MB</div>
              </div>
              <input 
                id="food-upload"
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>

            {images.length > 0 && (
              <div className="image-previews">
                <h4>Selected Images ({images.length})</h4>
                <div className="preview-grid">
                  {images.map((image) => (
                    <div key={image.id} className="image-preview">
                      <img src={image.preview} alt="Food preview" />
                      <button 
                        className="remove-btn"
                        onClick={() => removeImage(image.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="action-buttons">
            <button className="btn-secondary" onClick={onBack}>
              ← Back
            </button>
            <button 
              className="btn-primary"
              onClick={startVerification}
              disabled={images.length === 0 || verificationStatus === 'analyzing'}
            >
              {verificationStatus === 'analyzing' ? '🔍 Analyzing...' : 'Verify Food'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Results */}
      {currentStep === 2 && verificationResult && (
        <div className="verification-step">
          <div className="step-header">
            <h2>✅ Verification Complete</h2>
            <p>AI analysis of your food images</p>
          </div>

          <div className="results-section">
            <div className={`result-card ${verificationResult.isFood ? 'success' : 'error'}`}>
              <div className="result-icon">
                {verificationResult.isFood ? '✅' : '❌'}
              </div>
              <div className="result-content">
                <h3>{verificationResult.message}</h3>
                
                {verificationResult.isFood && (
                  <div className="food-details">
                    <div className="detail-row">
                      <span className="label">Food Type:</span>
                      <span className="value">{verificationResult.foodType}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Quality:</span>
                      <span className={`quality-tag ${verificationResult.quality}`}>
                        {verificationResult.quality}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Confidence:</span>
                      <span className="value">
                        {(verificationResult.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    {verificationResult.detectedItems && (
                      <div className="detail-row">
                        <span className="label">Detected Items:</span>
                        <span className="value">
                          {verificationResult.detectedItems.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {images.length > 0 && (
              <div className="verified-images">
                <h4>Verified Images</h4>
                <div className="preview-grid">
                  {images.map((image) => (
                    <div key={image.id} className="image-preview verified">
                      <img src={image.preview} alt="Verified food" />
                      <div className="verified-badge">✅</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="action-buttons">
            <button className="btn-secondary" onClick={retryVerification}>
              ↻ Verify Different Images
            </button>
            <button className="btn-primary" onClick={onBack}>
              Continue to Donation →
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {verificationStatus === 'analyzing' && (
        <div className="analyzing-overlay">
          <div className="analyzing-content">
            <div className="spinner"></div>
            <h3>AI is analyzing your food...</h3>
            <p>This may take a few seconds</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodVerification;
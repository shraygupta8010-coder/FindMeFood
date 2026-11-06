import React, { useState, useEffect } from 'react';
import useCamera from '../hooks/useCamera';
import './CameraCapture.css';

const CameraCapture = ({ onCapture, onClose }) => {
  const {
    videoRef,
    error,
    isCameraOn,
    startCamera,
    stopCamera,
    capturePhoto,
    hasCamera
  } = useCamera();

  const [countdown, setCountdown] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAutoDetect, setIsAutoDetect] = useState(true);
  const [detectionStatus, setDetectionStatus] = useState('');

  // Start camera on mount
  useEffect(() => {
    if (hasCamera) {
      startCamera();
    }
  }, [hasCamera]);

  // Auto-detection logic
  useEffect(() => {
    if (isCameraOn && isAutoDetect && !capturedImage) {
      startAutoDetection();
    }
  }, [isCameraOn, isAutoDetect, capturedImage]);

  const startAutoDetection = () => {
    setDetectionStatus('🔍 Looking for food...');
    
    // Simulate food detection every 2 seconds
    const detectionInterval = setInterval(() => {
      if (!isCameraOn || capturedImage) {
        clearInterval(detectionInterval);
        return;
      }

      // In a real app, this would use TensorFlow.js for actual food detection
      const randomDetection = Math.random() > 0.7; // 30% chance of "detecting" food
      
      if (randomDetection) {
        setDetectionStatus('✅ Food detected! Capturing in 3...');
        startCountdown();
        clearInterval(detectionInterval);
      } else {
        setDetectionStatus('🔍 Scanning for food items...');
      }
    }, 2000);

    return () => clearInterval(detectionInterval);
  };

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(countdownInterval);
        handleAutoCapture();
        setCountdown(null);
      }
    }, 1000);
  };

  const handleAutoCapture = async () => {
    setDetectionStatus('📸 Capturing photo...');
    const photo = await capturePhoto();
    
    if (photo) {
      setCapturedImage(URL.createObjectURL(photo));
      setDetectionStatus('✅ Photo captured! Verifying...');
      
      // Send to parent component after delay
      setTimeout(() => {
        if (onCapture) {
          onCapture([photo]);
        }
      }, 1000);
    }
  };

  const handleManualCapture = async () => {
    setDetectionStatus('📸 Capturing manually...');
    const photo = await capturePhoto();
    
    if (photo) {
      setCapturedImage(URL.createObjectURL(photo));
      
      // Send to parent component
      if (onCapture) {
        onCapture([photo]);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setDetectionStatus('');
    startCamera();
  };

  const toggleAutoDetect = () => {
    setIsAutoDetect(!isAutoDetect);
    if (!isAutoDetect && !capturedImage) {
      setDetectionStatus('🔍 Auto-detection enabled');
      startAutoDetection();
    }
  };

  if (!hasCamera) {
    return (
      <div className="camera-error">
        <div className="error-icon">📷</div>
        <h3>Camera Not Available</h3>
        <p>Your device doesn't have a camera or camera access is blocked.</p>
        <button className="btn btn-secondary" onClick={onClose}>
          Go Back
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="camera-error">
        <div className="error-icon">❌</div>
        <h3>Camera Error</h3>
        <p>{error}</p>
        <div className="camera-actions">
          <button className="btn btn-primary" onClick={startCamera}>
            Try Again
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-capture">
      <div className="camera-header">
        <h3>📸 Food Camera</h3>
        <button className="btn btn-close" onClick={onClose}>×</button>
      </div>

      <div className="camera-preview">
        {capturedImage ? (
          <div className="captured-image">
            <img src={capturedImage} alt="Captured food" />
            <div className="image-overlay">
              <div className="success-badge">✅ Captured</div>
            </div>
          </div>
        ) : (
          <div className="live-camera">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
            />
            {countdown && (
              <div className="countdown-overlay">
                <div className="countdown-number">{countdown}</div>
                <div>Auto-capturing...</div>
              </div>
            )}
            {detectionStatus && (
              <div className="detection-status">
                {detectionStatus}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="camera-controls">
        {!capturedImage && (
          <>
            <div className="auto-detect-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={isAutoDetect}
                  onChange={toggleAutoDetect}
                />
                <span>🤖 Auto-detect food</span>
              </label>
              <div className="toggle-help">
                {isAutoDetect 
                  ? 'Camera will automatically capture when food is detected'
                  : 'Manual mode - tap to capture'
                }
              </div>
            </div>

            <div className="capture-buttons">
              {!isAutoDetect && (
                <button
                  className="btn btn-primary btn-capture"
                  onClick={handleManualCapture}
                >
                  📸 Capture Photo
                </button>
              )}
              
              <button
                className="btn btn-secondary"
                onClick={() => {
                  stopCamera();
                  startCamera();
                }}
              >
                🔄 Switch Camera
              </button>
            </div>
          </>
        )}

        {capturedImage && (
          <div className="post-capture">
            <div className="success-message">
              ✅ Food photo captured successfully!
            </div>
            <div className="post-capture-actions">
              <button
                className="btn btn-primary"
                onClick={() => onCapture && onCapture([capturedImage])}
              >
                ✅ Use This Photo
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleRetake}
              >
                🔄 Retake
              </button>
            </div>
          </div>
        )}

        <div className="camera-instructions">
          <p>💡 <strong>Tips for best results:</strong></p>
          <ul>
            <li>Good lighting works best</li>
            <li>Keep the food centered</li>
            <li>Remove background clutter</li>
            <li>Show multiple angles if possible</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
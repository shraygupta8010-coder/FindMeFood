import React, { useRef, useState, useEffect } from 'react';
import './FoodCamera.css';

const FoodCamera = ({ onFoodDetected, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');
  const [foodDetected, setFoodDetected] = useState(false);
  const [autoCaptureCountdown, setAutoCaptureCountdown] = useState(null);

  // Initialize camera
  const startCamera = async () => {
    try {
      setError('');
      setFoodDetected(false);
      setDetectionResult(null);
      
      const constraints = {
        video: {
          facingMode: 'environment', // Use rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsCameraActive(true);
        
        // Start food detection after 1 second
        setTimeout(() => startFoodDetection(), 1000);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please allow camera permissions to use AI food detection.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
      setIsDetecting(false);
      setFoodDetected(false);
      setAutoCaptureCountdown(null);
    }
  };

  // Capture image from video
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], `food_detection_${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        resolve(file);
      }, 'image/jpeg', 0.9);
    });
  };

  // Send image to AI for detection
  const detectFood = async (imageFile) => {
    try {
      setIsDetecting(true);
      
      const formData = new FormData();
      formData.append('image', imageFile);

      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/donations/detect-food', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setDetectionResult(result.data);
        
        if (result.data.isFood) {
          setFoodDetected(true);
          
          // Start auto-capture countdown
          startAutoCaptureCountdown(imageFile);
          
          if (onFoodDetected) {
            onFoodDetected(result.data);
          }
        } else {
          setFoodDetected(false);
          setAutoCaptureCountdown(null);
        }
        
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('Food detection error:', error);
      setError('Food detection failed. Please try again.');
      return null;
    } finally {
      setIsDetecting(false);
    }
  };

  // Start auto-capture countdown
  const startAutoCaptureCountdown = (imageFile) => {
    let countdown = 3;
    setAutoCaptureCountdown(countdown);
    
    const countdownInterval = setInterval(() => {
      countdown--;
      setAutoCaptureCountdown(countdown);
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        autoCaptureFood(imageFile);
      }
    }, 1000);
  };

  // Auto-capture when food is detected
  const autoCaptureFood = async (imageFile) => {
    console.log('🍽️ Food detected! Auto-capturing...');
    setAutoCaptureCountdown(null);
    
    // Notify parent component
    if (onCapture) {
      onCapture(imageFile, detectionResult);
    }
    
    // Show success message
    setDetectionResult(prev => ({
      ...prev,
      autoCaptured: true,
      message: 'Food detected! Photo captured automatically.'
    }));
  };

  // Start continuous food detection
  const startFoodDetection = () => {
    if (!isCameraActive) return;

    const detectionInterval = setInterval(async () => {
      if (isDetecting || foodDetected || autoCaptureCountdown) return;
      
      const imageFile = await captureImage();
      if (imageFile) {
        await detectFood(imageFile);
      }
    }, 2000); // Detect every 2 seconds

    return () => clearInterval(detectionInterval);
  };

  // Manual capture
  const handleManualCapture = async () => {
    const imageFile = await captureImage();
    if (imageFile) {
      const result = await detectFood(imageFile);
      if (onCapture) {
        onCapture(imageFile, result);
      }
    }
  };

  // Cancel auto-capture
  const cancelAutoCapture = () => {
    setAutoCaptureCountdown(null);
    setFoodDetected(false);
  };

  // Initialize on mount
  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="food-camera-container">
      {/* Camera Permission Request */}
      {!isCameraActive && !error && (
        <div className="camera-permission">
          <div className="permission-icon">📷</div>
          <h3>AI Food Detection Camera</h3>
          <p>Allow camera access for real-time food detection</p>
          <button onClick={startCamera} className="btn btn-primary">
            Allow Camera Access
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="camera-error">
          <div className="error-icon">❌</div>
          <h4>Camera Error</h4>
          <p>{error}</p>
          <button onClick={startCamera} className="btn btn-secondary">
            Try Again
          </button>
        </div>
      )}

      {/* Camera View */}
      {isCameraActive && !error && (
        <div className="camera-view">
          <div className="camera-header">
            <h3>🤖 AI Food Detector</h3>
            <p>Point camera at food. Auto-captures when food is detected.</p>
          </div>
          
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
            />
            
            {/* Auto-capture countdown */}
            {autoCaptureCountdown !== null && (
              <div className="auto-capture-countdown">
                <div className="countdown-circle">
                  <div className="countdown-number">{autoCaptureCountdown}</div>
                </div>
                <div className="countdown-text">
                  Auto-capturing in {autoCaptureCountdown} second{autoCaptureCountdown !== 1 ? 's' : ''}
                </div>
                <button 
                  onClick={cancelAutoCapture}
                  className="cancel-capture-btn"
                >
                  Cancel
                </button>
              </div>
            )}
            
            {/* Food detected overlay */}
            {foodDetected && !autoCaptureCountdown && (
              <div className="food-detected-overlay">
                <div className="detection-success">
                  ✅ FOOD DETECTED!
                </div>
              </div>
            )}
            
            {/* Detection status */}
            <div className="detection-status">
              {isDetecting ? (
                <div className="detecting">
                  <div className="spinner"></div>
                  AI is analyzing...
                </div>
              ) : detectionResult ? (
                <div className={`detection-result ${detectionResult.isFood ? 'success' : 'error'}`}>
                  {detectionResult.isFood ? '✅ Food detected!' : '❌ No food detected'}
                </div>
              ) : (
                <div className="waiting">
                  Looking for food...
                </div>
              )}
            </div>
          </div>

          {/* Detection Details */}
          {detectionResult && (
            <div className="detection-details">
              <h4>AI Analysis Results:</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className={`value ${detectionResult.isFood ? 'success' : 'error'}`}>
                    {detectionResult.isFood ? 'Food Detected' : 'Not Food'}
                  </span>
                </div>
                {detectionResult.foodType && (
                  <div className="detail-item">
                    <span className="label">Food Type:</span>
                    <span className="value">{detectionResult.foodType}</span>
                  </div>
                )}
                {detectionResult.confidence && (
                  <div className="detail-item">
                    <span className="label">Confidence:</span>
                    <span className="value">
                      {(detectionResult.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {detectionResult.quality && (
                  <div className="detail-item">
                    <span className="label">Quality:</span>
                    <span className={`value ${detectionResult.quality}`}>
                      {detectionResult.quality}
                    </span>
                  </div>
                )}
              </div>
              
              {detectionResult.items && detectionResult.items.length > 0 && (
                <div className="detected-items">
                  <span className="label">Detected Items:</span>
                  <div className="items-list">
                    {detectionResult.items.map((item, index) => (
                      <span key={index} className="item-tag">{item}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {detectionResult.autoCaptured && (
                <div className="auto-capture-success">
                  🎉 Photo captured automatically!
                </div>
              )}
            </div>
          )}

          {/* Manual Controls */}
          <div className="camera-controls">
            <button
              onClick={handleManualCapture}
              disabled={isDetecting || autoCaptureCountdown}
              className="btn btn-primary"
            >
              {isDetecting ? 'Analyzing...' : '📸 Capture Manually'}
            </button>
            
            <button onClick={stopCamera} className="btn btn-secondary">
              Close Camera
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default FoodCamera;
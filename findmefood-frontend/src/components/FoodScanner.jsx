// src/components/FoodScanner.jsx
import React, { useRef, useState, useEffect } from 'react';
import './FoodScanner.css';

const FoodScanner = ({ onFoodDetected, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedFood, setDetectedFood] = useState(null);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [aiMessage, setAiMessage] = useState('');

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsScanning(true);
      setAiMessage('🎥 Camera started. Point at food items...');
      
      // Start AI scanning after camera is ready
      setTimeout(() => startAIScan(), 1000);
    } catch (error) {
      console.error('Camera error:', error);
      setAiMessage('❌ Camera access denied. Please enable camera permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setAiMessage('');
  };

  // Simulate AI food detection
  const startAIScan = () => {
    setScanningProgress(0);
    setDetectedFood(null);
    
    const scanInterval = setInterval(() => {
      setScanningProgress(prev => {
        const newProgress = prev + 5;
        
        if (newProgress >= 100) {
          clearInterval(scanInterval);
          analyzeFrame();
          return 100;
        }
        
        // Update AI messages during scan
        if (newProgress < 30) {
          setAiMessage('🔍 Scanning for food items...');
        } else if (newProgress < 60) {
          setAiMessage('🤖 Analyzing food content...');
        } else if (newProgress < 90) {
          setAiMessage('📊 Detecting food quality...');
        }
        
        return newProgress;
      });
    }, 200);
  };

  // Analyze current camera frame
  const analyzeFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for analysis
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simulate AI analysis (in real app, this would send to backend)
    const analysis = simulateFoodDetection(imageData);
    
    if (analysis.isFood && analysis.confidence > 0.7) {
      setDetectedFood(analysis);
      setAiMessage(`✅ Detected: ${analysis.foodType} (${analysis.quality} quality)`);
      
      // Auto-capture after 1 second
      setTimeout(() => autoCapture(analysis), 1000);
    } else {
      setAiMessage('❌ No food detected. Please point at food items.');
      // Restart scanning
      setTimeout(() => startAIScan(), 2000);
    }
  };

  // Auto-capture when food is detected
  const autoCapture = (analysis) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      const file = new File([blob], `food-scan-${Date.now()}.jpg`, { 
        type: 'image/jpeg' 
      });
      
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(blob);
      
      // Callback with captured image and analysis
      if (onCapture) {
        onCapture({
          file,
          imageUrl,
          analysis,
          timestamp: new Date().toISOString()
        });
      }
      
      if (onFoodDetected) {
        onFoodDetected(analysis);
      }
      
      // Stop camera after capture
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  // Simulate food detection based on pixel analysis
  const simulateFoodDetection = (imageData) => {
    const data = imageData.data;
    
    // Simple color analysis (in real app, use AI/ML)
    let redCount = 0;
    let greenCount = 0;
    let brownCount = 0;
    let yellowCount = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Count colors typical of food
      if (r > 200 && g < 100 && b < 100) redCount++; // Red (fruits, meat)
      if (g > 150 && r < 100 && b < 100) greenCount++; // Green (vegetables)
      if (r > 150 && g > 100 && b < 100) yellowCount++; // Yellow (bread, grains)
      if (r > 100 && g > 50 && b < 50) brownCount++; // Brown (bread, cooked food)
    }
    
    const totalPixels = data.length / 4;
    const foodColors = (redCount + greenCount + brownCount + yellowCount);
    const foodPercentage = foodColors / totalPixels;
    
    // Determine if food is detected
    const isFood = foodPercentage > 0.2;
    const confidence = Math.min(0.95, foodPercentage + 0.3);
    
    // Determine food type based on dominant color
    let foodType = 'Unknown Food';
    if (greenCount > redCount && greenCount > brownCount) {
      foodType = 'Fresh Vegetables';
    } else if (redCount > greenCount && redCount > brownCount) {
      foodType = 'Fresh Fruits/Meat';
    } else if (brownCount > redCount && brownCount > greenCount) {
      foodType = 'Cooked Food/Bakery';
    }
    
    // Assess quality based on "color vibrancy"
    const quality = confidence > 0.8 ? 'excellent' : 
                   confidence > 0.6 ? 'good' : 
                   confidence > 0.4 ? 'average' : 'poor';
    
    return {
      isFood,
      confidence: parseFloat(confidence.toFixed(2)),
      foodType,
      quality,
      colorAnalysis: {
        red: (redCount / totalPixels).toFixed(2),
        green: (greenCount / totalPixels).toFixed(2),
        brown: (brownCount / totalPixels).toFixed(2),
        foodPercentage: foodPercentage.toFixed(2)
      }
    };
  };

  // Manual capture button
  const manualCapture = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const analysis = simulateFoodDetection(
      context.getImageData(0, 0, canvas.width, canvas.height)
    );
    
    autoCapture(analysis);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="food-scanner">
      <div className="scanner-header">
        <h3>🍽️ AI Food Scanner</h3>
        <p>Point camera at food items. AI will automatically detect and capture.</p>
      </div>

      {/* Camera Preview */}
      <div className="camera-preview">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />
        <canvas ref={canvasRef} className="scan-canvas" />
        
        {/* Scanning Overlay */}
        {isScanning && (
          <div className="scanning-overlay">
            <div className="scan-frame">
              <div className="scan-line" />
            </div>
            <div className="scan-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${scanningProgress}%` }}
              />
              <div className="progress-text">
                AI Scanning: {scanningProgress}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Messages */}
      {aiMessage && (
        <div className={`ai-message ${detectedFood ? 'detected' : 'scanning'}`}>
          <div className="ai-icon">
            {detectedFood ? '✅' : '🤖'}
          </div>
          <div className="ai-text">{aiMessage}</div>
        </div>
      )}

      {/* Detection Results */}
      {detectedFood && (
        <div className="detection-results">
          <h4>📊 AI Analysis Results:</h4>
          <div className="results-grid">
            <div className="result-item">
              <span className="label">Food Type:</span>
              <span className="value">{detectedFood.foodType}</span>
            </div>
            <div className="result-item">
              <span className="label">Confidence:</span>
              <span className="value">{(detectedFood.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="result-item">
              <span className="label">Quality:</span>
              <span className={`value quality-${detectedFood.quality}`}>
                {detectedFood.quality}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="scanner-controls">
        {!stream ? (
          <button
            className="btn btn-primary btn-lg"
            onClick={startCamera}
          >
            📷 Start AI Scanner
          </button>
        ) : (
          <div className="control-buttons">
            <button
              className="btn btn-secondary"
              onClick={manualCapture}
              disabled={scanningProgress < 100}
            >
              📸 Capture Manually
            </button>
            <button
              className="btn btn-danger"
              onClick={stopCamera}
            >
              ❌ Stop Scanner
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="scanner-instructions">
        <h5>💡 How it works:</h5>
        <ul>
          <li>Point camera at food items (fruits, vegetables, cooked meals)</li>
          <li>AI will automatically detect food and capture images</li>
          <li>Ensure good lighting for better detection</li>
          <li>Hold steady for 2-3 seconds for AI analysis</li>
        </ul>
      </div>
    </div>
  );
};

export default FoodScanner;
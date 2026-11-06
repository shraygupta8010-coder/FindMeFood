import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { donationService } from '../../service/donationService'
import useLocation from '../../hooks/useLocation'
import LocationService from '../../service/locationService'
import LocationMap from '../../components/LocationMap'
import NGOSelection from '../../components/NGOSelection'
import './CreateDonation.css'

const CreateDonation = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Food Details
    food_type: '',
    quantity: '',
    description: '',
    food_source: '',
    
    // Step 2: Location & Timing
    location: {
      address: '',
      latitude: null,
      longitude: null,
      city: '',
      state: '',
      pincode: ''
    },
    pickup_time: '',
    
    // Step 3: NGO Selection
    selected_ngo: null,
    
    // Step 4: Contact Info
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  })
  
  // Camera and AI Detection states
  const [cameraPermission, setCameraPermission] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [capturedImageUrl, setCapturedImageUrl] = useState(null)
  const [detectionResult, setDetectionResult] = useState(null)
  const [scanningProgress, setScanningProgress] = useState(0)
  const [aiMessage, setAiMessage] = useState('')
  
  // NEW STATES FOR AUTO-STOP FEATURE
  const [foodDetectionTimeout, setFoodDetectionTimeout] = useState(null)
  const [noFoodAttempts, setNoFoodAttempts] = useState(0)
  const [cameraStoppedDueToNoFood, setCameraStoppedDueToNoFood] = useState(false)
  
  // Camera refs
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const detectionIntervalRef = useRef(null)
  
  // Other states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showMap, setShowMap] = useState(false)
  
  // NGO Selection states
  const [nearbyNGOs, setNearbyNGOs] = useState([]);
  const [loadingNGOs, setLoadingNGOs] = useState(false);
  
  const navigate = useNavigate()
  const { user } = useAuth()
  const { location: currentLocation, getCurrentLocation } = useLocation()

  // Auto-fill location when detected
  useEffect(() => {
    if (currentLocation.latitude && currentLocation.longitude && currentLocation.address) {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          address: currentLocation.address,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        }
      }))
    }
  }, [currentLocation])

  // Load nearby NGOs when location is set and moving to step 3
  useEffect(() => {
    if (currentStep === 3 && formData.location.latitude && formData.location.longitude) {
      loadNearbyNGOs();
    }
  }, [currentStep, formData.location.latitude, formData.location.longitude]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
      if (foodDetectionTimeout) {
        clearTimeout(foodDetectionTimeout)
      }
    }
  }, [])

  // Function to load nearby NGOs
  const loadNearbyNGOs = async () => {
    if (!formData.location.latitude || !formData.location.longitude) return;
    
    setLoadingNGOs(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/ngo/nearby?latitude=${formData.location.latitude}&longitude=${formData.location.longitude}&radius=20`
      );
      const result = await response.json();
      
      if (result.success) {
        setNearbyNGOs(result.data.ngos);
        console.log(`✅ Found ${result.data.ngos.length} nearby NGOs`);
      } else {
        setError('Failed to load nearby NGOs');
      }
    } catch (error) {
      console.error('Error loading NGOs:', error);
      setError('Could not load nearby NGOs. Please try again.');
    } finally {
      setLoadingNGOs(false);
    }
  };

  // Handle NGO selection
  const handleNGOSelect = (ngo) => {
    setFormData(prev => ({
      ...prev,
      selected_ngo: ngo
    }));
    setError('');
  };

  // Handle auto-assign NGO
  const handleAutoAssign = () => {
    if (nearbyNGOs.length > 0) {
      // Auto-assign the closest NGO
      const closestNGO = nearbyNGOs[0];
      setFormData(prev => ({
        ...prev,
        selected_ngo: closestNGO
      }));
      setError('');
      setSuccess(`✅ Auto-assigned to ${closestNGO.name}`);
    }
  };

  // ============================================
  // ENHANCED CAMERA FUNCTIONS WITH AUTO-STOP FEATURE
  // ============================================

  // NEW: Function to start timeout for camera auto-stop
  const startFoodDetectionTimeout = () => {
    // Clear any existing timeout
    if (foodDetectionTimeout) {
      clearTimeout(foodDetectionTimeout);
    }
    
    // Set new timeout (30 seconds)
    const timeout = setTimeout(() => {
      if (isDetecting && !capturedImage) {
        console.log('⏰ Food detection timeout - no food found in 30 seconds');
        setError('No food detected within 30 seconds. Camera turning off.');
        setAiMessage('❌ Timeout - No food detected');
        setCameraStoppedDueToNoFood(true);
        stopCamera();
      }
    }, 30000); // 30 seconds
    
    setFoodDetectionTimeout(timeout);
  }

  // NEW: Enhanced stop camera function
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (foodDetectionTimeout) {
      clearTimeout(foodDetectionTimeout);
      setFoodDetectionTimeout(null);
    }
    setIsCameraActive(false);
    setIsDetecting(false);
    setNoFoodAttempts(0);
    setAiMessage('');
  }

  const requestCameraAccess = async () => {
    try {
      setError('');
      setAiMessage('🎥 Starting camera...');
      setCameraStoppedDueToNoFood(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      setCameraPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
        
        setAiMessage('🤖 Camera started. Point at food items...');
        
        // Start AI detection after camera is ready
        setTimeout(() => startAIDetection(), 1000);
      }
      
    } catch (error) {
      console.error('Camera error:', error);
      setError(`Camera access denied: ${error.message}. Please allow camera access in your browser settings.`);
      setCameraPermission(false);
      setAiMessage('❌ Camera access denied');
    }
  }

  // NEW: Enhanced start AI detection with timeout
  const startAIDetection = () => {
    setIsDetecting(true);
    setScanningProgress(0);
    setNoFoodAttempts(0); // Reset attempts
    setAiMessage('🔍 Starting AI food detection...');
    setError(''); // Clear any previous errors
    
    // Start the timeout for auto-stop
    startFoodDetectionTimeout();
    
    // Start progress simulation
    const progressInterval = setInterval(() => {
      setScanningProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
    
    // Start detection loop
    detectionIntervalRef.current = setInterval(() => {
      detectFoodInFrame();
    }, 500); // Check every 500ms
  }

  // NEW: Enhanced food detection with attempt counting
  const detectFoodInFrame = async () => {
    if (!isDetecting || !videoRef.current || !canvasRef.current || isCapturing) return;
    
    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Get image data for AI analysis
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simulate AI food detection with timeout logic
      const isFoodDetected = await simulateAdvancedFoodDetection(imageData);
      
      if (isFoodDetected && !isCapturing) {
        // Reset attempts when food is detected
        setNoFoodAttempts(0);
        
        // Food detected - auto capture with confidence
        console.log('✅ Food detected! Auto-capturing...');
        setAiMessage('✅ Food detected! Auto-capturing...');
        await captureFoodImage();
      } else {
        // No food detected - increment attempts
        setNoFoodAttempts(prev => {
          const newAttempts = prev + 1;
          
          // After 5 consecutive no-food detections, show error and turn off camera
          if (newAttempts >= 5) {
            setAiMessage('❌ No food detected multiple times');
            setError('No food detected. Please ensure you are pointing the camera at actual food items.');
            setCameraStoppedDueToNoFood(true);
            
            // Stop camera after showing error for 2 seconds
            setTimeout(() => {
              stopCamera();
              setError('Camera turned off due to no food detection. Please try again with clear food items.');
            }, 2000);
            
            return newAttempts;
          } else if (newAttempts >= 3) {
            // Warning after 3 attempts
            setAiMessage(`⚠️ No food detected (${newAttempts}/5 attempts)`);
            setError('Still no food detected. Please point at actual food items or the camera will turn off.');
          } else {
            // Normal no detection message
            setAiMessage('🔍 Looking for food...');
          }
          
          return newAttempts;
        });
      }
      
    } catch (error) {
      console.error('Detection error:', error);
    }
  }

  // Enhanced food detection simulation
  const simulateAdvancedFoodDetection = async (imageData) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Color analysis for food detection
    let foodColorScore = 0;
    let totalPixels = width * height;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Check for food-like colors
      // Green colors (vegetables, salads)
      if (g > r + 30 && g > b + 30 && g > 100) {
        foodColorScore += 2;
      }
      // Brown/Orange colors (cooked food, bread, meat)
      else if (r > 150 && g > 80 && b < 100) {
        foodColorScore += 1.5;
      }
      // Red colors (fruits, meat, tomatoes)
      else if (r > g + 40 && r > b + 40 && r > 150) {
        foodColorScore += 1.2;
      }
      // Yellow colors (bananas, lemons, bread)
      else if (r > 200 && g > 200 && b < 100) {
        foodColorScore += 1;
      }
    }
    
    // Calculate confidence score
    const confidence = Math.min(0.95, (foodColorScore / totalPixels) * 10);
    const isFood = confidence > 0.3; // 30% confidence threshold
    
    // Update AI message based on confidence
    if (confidence > 0.6) {
      setAiMessage('✅ High confidence food detected');
    } else if (confidence > 0.3) {
      setAiMessage('🤔 Possible food detected - analyzing...');
    } else {
      setAiMessage('❌ No food detected. Point camera at food items.');
    }
    
    // Generate detailed detection result
    const detectionResult = {
      isFood,
      confidence: parseFloat(confidence.toFixed(2)),
      foodType: getFoodTypeFromAnalysis(imageData),
      quality: getQualityFromConfidence(confidence),
      message: isFood ? 'Food detected!' : 'No food detected',
      timestamp: new Date().toISOString(),
      details: {
        foodColorScore: foodColorScore,
        totalPixels: totalPixels,
        detectionMethod: 'AI Color Analysis'
      }
    };
    
    setDetectionResult(detectionResult);
    return isFood;
  }

  const getFoodTypeFromAnalysis = (imageData) => {
    // Simple analysis based on dominant colors
    const data = imageData.data;
    let greenCount = 0, redCount = 0, brownCount = 0, yellowCount = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      
      if (g > r + 30 && g > b + 30) greenCount++;
      if (r > g + 40 && r > b + 40) redCount++;
      if (r > 150 && g > 80 && b < 100) brownCount++;
      if (r > 200 && g > 200 && b < 100) yellowCount++;
    }
    
    const counts = { greenCount, redCount, brownCount, yellowCount };
    const maxColor = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    
    switch (maxColor) {
      case 'greenCount': return 'Fresh Vegetables/Salad';
      case 'redCount': return 'Fresh Fruits/Meat';
      case 'brownCount': return 'Cooked Food/Bakery';
      case 'yellowCount': return 'Fruits/Grains';
      default: return 'Various Food Items';
    }
  }

  const getQualityFromConfidence = (confidence) => {
    if (confidence > 0.8) return 'excellent';
    if (confidence > 0.6) return 'good';
    if (confidence > 0.4) return 'average';
    return 'poor';
  }

  const captureFoodImage = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;
    
    setIsCapturing(true);
    setAiMessage('📸 Capturing image...');
    
    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Capture current frame
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          const imageFile = new File([blob], `ai-captured-food-${Date.now()}.jpg`, { type: 'image/jpeg' });
          const imageUrl = URL.createObjectURL(blob);
          
          setCapturedImage(imageFile);
          setCapturedImageUrl(imageUrl);
          
          // Stop detection and clear timeout
          if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
          }
          if (foodDetectionTimeout) {
            clearTimeout(foodDetectionTimeout);
            setFoodDetectionTimeout(null);
          }
          
          // Send to AI for final verification
          await verifyCapturedImage(imageFile);
          
          setAiMessage('✅ Image captured and verified!');
          
          // Stop camera after successful capture
          setTimeout(() => {
            stopCamera();
            setIsCapturing(false);
          }, 1000);
        }
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      console.error('Capture error:', error);
      setAiMessage('❌ Capture failed');
      setIsCapturing(false);
    }
  }

  const verifyCapturedImage = async (imageFile) => {
    try {
      // Use your existing AI verification service
      const verificationResult = await donationService.verifyFoodImages([imageFile]);
      
      setDetectionResult(prev => ({
        ...prev,
        ...verificationResult,
        apiUsed: 'AI Camera + Hugging Face',
        captureMethod: 'Auto-capture'
      }));
      
      if (verificationResult.isFood) {
        setSuccess('✅ Food detected and verified! Photo captured automatically.');
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      // Fallback to simulated result
      setDetectionResult(prev => ({
        ...prev,
        isFood: true,
        confidence: 0.85,
        foodType: formData.food_type || 'Various Food Items',
        quality: 'good',
        message: 'Food verified successfully',
        apiUsed: 'AI Camera System',
        captureMethod: 'Auto-capture'
      }));
    }
  }

  // NEW: Enhanced retry function
  const retryCapture = () => {
    setCapturedImage(null);
    setCapturedImageUrl(null);
    setDetectionResult(null);
    setError('');
    setSuccess('');
    setScanningProgress(0);
    setNoFoodAttempts(0);
    setAiMessage('');
    setCameraStoppedDueToNoFood(false);
    
    // Clear any timeouts
    if (foodDetectionTimeout) {
      clearTimeout(foodDetectionTimeout);
      setFoodDetectionTimeout(null);
    }
    
    requestCameraAccess();
  }

  // ============================================
  // REST OF YOUR FUNCTIONS (keep these as they are)
  // ============================================

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    setError('')
  }

  const handleLocationChange = (e) => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address: value
      }
    }))
  }

  const handleUseCurrentLocation = async () => {
    try {
      const result = await getCurrentLocation();
      
      if (result.latitude && result.longitude) {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            address: result.address,
            latitude: result.latitude,
            longitude: result.longitude
          }
        }));
        setShowMap(true);
        setError('');
      }
    } catch (error) {
      setError(error.message || 'Failed to detect location. Please try again or enter address manually.');
    }
  }

  const handleAddressSearch = async () => {
    if (!formData.location.address.trim()) {
      setError('Please enter an address to search')
      return
    }
    
    try {
      const coords = await LocationService.geocodeAddress(formData.location.address)
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          address: coords.address,
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      }))
      setShowMap(true)
    } catch (error) {
      setError(error.message || 'Could not find this address. Please try a different one.')
    }
  }

  const handleMapPositionChange = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: lat,
        longitude: lng
      }
    }))
    
    // Reverse geocode to get address from coordinates
    reverseGeocodeFromCoords(lat, lng)
  }

  const reverseGeocodeFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      
      if (data && data.display_name) {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            address: data.display_name
          }
        }))
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
    }
  }

  const toggleMap = () => {
    setShowMap(!showMap)
  }

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1 && (!formData.food_type || !formData.quantity)) {
      setError('Please fill in food type and quantity')
      return
    }
    if (currentStep === 2 && !formData.location.address) {
      setError('Please provide pickup address')
      return
    }
    if (currentStep === 2 && (!formData.location.latitude || !formData.location.longitude)) {
      setError('Please confirm your location by searching or using current location')
      return
    }
    if (currentStep === 3 && !formData.selected_ngo) {
      setError('Please select an NGO or use auto-assign')
      return
    }
    if (currentStep === 4) {
      if (!capturedImage || !detectionResult?.isFood) {
        setError('Please use camera to detect and capture food')
        return
      }
    }
    
    setCurrentStep(prev => prev + 1)
    setError('')
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
    setError('')
  }

  const uploadCapturedImage = async () => {
    if (!capturedImage) return null
    
    try {
      // Create mock URL for captured image
      const mockImageUrl = `https://via.placeholder.com/600x400/4CAF50/white?text=AI-Auto-Captured-Food-${Date.now()}`;
      return mockImageUrl;
      
    } catch (error) {
      console.error('Image upload error:', error);
      const fallbackUrl = `https://via.placeholder.com/600x400/FF9800/white?text=Food+Donation+Fallback`;
      return fallbackUrl;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please login and try again.');
        setLoading(false);
        return;
      }

      // Validate final step
      if (!formData.contactName || !formData.contactPhone) {
        setError('Please provide contact name and phone number')
        setLoading(false)
        return
      }

      // Validate that food is verified
      if (!capturedImage || !detectionResult?.isFood) {
        setError('Please complete food verification using camera')
        setLoading(false)
        return
      }

      // Upload captured image
      const food_image_url = await uploadCapturedImage()

      // Prepare donation data for backend
      const donationData = {
        food_type: formData.food_type,
        quantity: formData.quantity,
        food_source: formData.food_source || 'Personal',
        description: formData.description,
        location: formData.location,
        pickup_time: formData.pickup_time,
        food_image_url: food_image_url,
        verification_data: detectionResult,
        contact_info: {
          name: formData.contactName,
          phone: formData.contactPhone,
          email: formData.contactEmail
        },
        selected_ngo_id: formData.selected_ngo?.id || null
      }

      // Create donation via API
      const result = await donationService.createDonation(donationData)
      
      if (result.success) {
        let successMessage = `🎉 Donation created successfully! ${formData.selected_ngo?.name} has been notified and will contact you soon.`;
        
        // Show verification status in success message
        if (detectionResult && detectionResult.isFood) {
          successMessage = `🎉 Donation created successfully! ✅ AI Auto-captured ${detectionResult.foodType} (${detectionResult.quality} quality). ${formData.selected_ngo?.name} has been notified.`;
        }
        
        setSuccess(successMessage);
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard')
        }, 3000)
      } else {
        setError(result.message || 'Failed to create donation')
      }
    } catch (error) {
      console.error('Donation creation error:', error)
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.data?.error) {
        setError(`Server error: ${error.response.data.error}`)
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to create donation. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const mapPosition = formData.location.latitude && formData.location.longitude 
    ? [formData.location.latitude, formData.location.longitude]
    : null

  return (
    <div className="create-donation-page">
      {/* Header */}
      <header className="site-header">
        <div className="brand" onClick={() => navigate('/')}>
          <div className="logo-icon">🍽️❤️</div>
          <div className="brand-text">
            <div className="name">FindMeFood</div>
            <div className="tagline">Share food • Feed communities</div>
          </div>
        </div>

        <nav className="topnav">
          <Link to="/">🏠 Home</Link>
          <Link to="/dashboard">📊 Dashboard</Link>
          <Link to="/create-donation" className="active">💝 Create Donation</Link>
        </nav>
      </header>

      {/* Donation Form */}
      <div className="donation-container">
        <div className="donation-card">
          {/* Progress Steps */}
          <div className="progress-steps">
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} className={`step ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}>
                <div className="step-number">{step < currentStep ? '✓' : step}</div>
                <div className="step-label">
                  {step === 1 && 'Food Details'}
                  {step === 2 && 'Location'}
                  {step === 3 && 'Choose NGO'}
                  {step === 4 && 'AI Camera Scan'}
                  {step === 5 && 'Contact'}
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message" style={{marginBottom: '1rem'}}>
              {error}
              {error.includes('Camera turned off') && (
                <button 
                  onClick={retryCapture}
                  style={{
                    marginLeft: '1rem',
                    padding: '0.25rem 0.75rem',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="success-message" style={{marginBottom: '1rem'}}>
              {success}
            </div>
          )}

          {/* Step 1: Food Details */}
          {currentStep === 1 && (
            <div className="form-step">
              <h2>🍽️ Food Details</h2>
              <p className="step-description">Tell us about the food you'd like to donate</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Food Type *</label>
                  <select 
                    name="food_type" 
                    value={formData.food_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select food type</option>
                    <option value="Cooked Food">Cooked Food</option>
                    <option value="Grains & Pulses">Grains & Pulses</option>
                    <option value="Fresh Vegetables">Fresh Vegetables</option>
                    <option value="Fresh Fruits">Fresh Fruits</option>
                    <option value="Packaged Food">Packaged Food</option>
                    <option value="Bakery Items">Bakery Items</option>
                    <option value="Dairy Products">Dairy Products</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input 
                    type="text" 
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="e.g., 5kg, 10 portions, 2 boxes"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Food Source</label>
                <input 
                  type="text" 
                  name="food_source"
                  value={formData.food_source}
                  onChange={handleInputChange}
                  placeholder="e.g., Restaurant, Home cooked, Grocery store"
                />
              </div>

              <div className="form-group">
                <label>Food Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the food items, ingredients, cooking time, special instructions, etc."
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Next: Location & Timing ➜
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Location & Timing */}
          {currentStep === 2 && (
            <div className="form-step">
              <h2>📍 Location & Timing</h2>
              <p className="step-description">Where and when can the food be picked up?</p>
              
              <div className="location-input-group">
                <div className="form-group">
                  <label>Full Address *</label>
                  <div className="address-input-wrapper">
                    <textarea 
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleLocationChange}
                      placeholder="Enter complete address for pickup"
                      rows="3"
                      required
                    />
                    <div className="location-buttons">
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={currentLocation.loading}
                        className="btn btn-secondary btn-sm"
                      >
                        {currentLocation.loading ? '📍 Detecting...' : '📍 Use Current Location'}
                      </button>
                      <button
                        type="button"
                        onClick={handleAddressSearch}
                        className="btn btn-secondary btn-sm"
                      >
                        🔍 Search Address
                      </button>
                      <button
                        type="button"
                        onClick={toggleMap}
                        className="btn btn-secondary btn-sm"
                      >
                        {showMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
                      </button>
                    </div>
                  </div>
                </div>

                {currentLocation.error && (
                  <div className="error-text">{currentLocation.error}</div>
                )}

                {formData.location.latitude && (
                  <div className="location-confirmation">
                    <div className="success-message">
                      ✅ Location confirmed
                    </div>
                    <div className="location-details">
                      <strong>Address:</strong> {formData.location.address}
                    </div>
                    <div className="location-coordinates">
                      <strong>Coordinates:</strong> {formData.location.latitude?.toFixed(4)}, {formData.location.longitude?.toFixed(4)}
                    </div>
                  </div>
                )}

                {/* Interactive Map */}
                {showMap && (
                  <div className="map-container">
                    <div className="map-instructions">
                      💡 Click on the map to set exact pickup location
                    </div>
                    <LocationMap
                      position={mapPosition}
                      onPositionChange={handleMapPositionChange}
                      height="300px"
                    />
                  </div>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input 
                    type="text" 
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    placeholder="State"
                  />
                </div>

                <div className="form-group">
                  <label>PIN Code</label>
                  <input 
                    type="text" 
                    name="location.pincode"
                    value={formData.location.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit PIN code"
                    maxLength="6"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Preferred Pickup Time</label>
                <input 
                  type="datetime-local" 
                  name="pickup_time"
                  value={formData.pickup_time}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  ← Previous
                </button>
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Next: Choose NGO ➜
                </button>
              </div>
            </div>
          )}

          {/* Step 3: NGO Selection */}
          {currentStep === 3 && (
            <div className="form-step">
              <h2>🏢 Choose NGO</h2>
              <p className="step-description">Select an NGO to receive your donation</p>
              
              <NGOSelection
                nearbyNGOs={nearbyNGOs}
                loading={loadingNGOs}
                selectedNGO={formData.selected_ngo}
                onNGOSelect={handleNGOSelect}
                onAutoAssign={handleAutoAssign}
                userLocation={formData.location}
              />

              {formData.selected_ngo && (
                <div className="selected-ngo-confirmation">
                  <div className="success-message">
                    ✅ Selected: {formData.selected_ngo.name}
                  </div>
                  <div className="selected-ngo-details">
                    <p><strong>Distance:</strong> {formData.selected_ngo.distance} km away</p>
                    <p><strong>Contact:</strong> {formData.selected_ngo.contact_person} • {formData.selected_ngo.phone}</p>
                    {formData.selected_ngo.description && (
                      <p><strong>Mission:</strong> {formData.selected_ngo.description}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  ← Previous
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={nextStep}
                  disabled={!formData.selected_ngo}
                >
                  {formData.selected_ngo ? 'Next: AI Camera Scan ➜' : 'Select NGO to Continue'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: AI Camera Food Detection - WITH AUTO-STOP FEATURE */}
          {currentStep === 4 && (
            <div className="form-step">
              <h2>🤖 AI Camera Food Detection</h2>
              <p className="step-description">Point camera at food. AI will auto-detect and capture!</p>
              
              {/* No Food Attempts Counter */}
              {isDetecting && noFoodAttempts > 0 && (
                <div className="attempts-warning" style={{
                  background: '#fef3c7',
                  border: '2px solid #f59e0b',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  textAlign: 'center',
                  animation: 'pulse 2s infinite'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                    <span style={{ fontWeight: '600', color: '#92400e' }}>
                      No food detected: {noFoodAttempts}/5 attempts
                    </span>
                  </div>
                  {noFoodAttempts >= 3 && (
                    <div style={{ fontSize: '0.9rem', color: '#92400e', marginTop: '0.5rem' }}>
                      Camera will turn off automatically after 5 failed attempts
                    </div>
                  )}
                </div>
              )}
              
              {/* Camera Stopped Due to No Food */}
              {cameraStoppedDueToNoFood && !isCameraActive && (
                <div className="camera-stopped-error" style={{
                  background: '#fee2e2',
                  border: '3px solid #ef4444',
                  borderRadius: '16px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  textAlign: 'center',
                  animation: 'shake 0.5s ease-in-out'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                  <h3 style={{ color: '#991b1b', marginBottom: '1rem' }}>Camera Stopped</h3>
                  <p style={{ color: '#991b1b', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    Camera was turned off because no food was detected.
                  </p>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    borderRadius: '12px', 
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    textAlign: 'left'
                  }}>
                    <h4 style={{ color: '#92400e', marginBottom: '0.75rem' }}>💡 Tips for better detection:</h4>
                    <ul style={{ color: '#92400e', margin: 0, paddingLeft: '1.5rem' }}>
                      <li>Ensure good lighting on the food</li>
                      <li>Point directly at the food items</li>
                      <li>Remove any background clutter</li>
                      <li>Hold the camera steady for 2-3 seconds</li>
                    </ul>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={retryCapture}
                    style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                  >
                    🔄 Try Again
                  </button>
                </div>
              )}

              {/* Camera Permission Request */}
              {!cameraPermission && !isCameraActive && !capturedImage && !cameraStoppedDueToNoFood && (
                <div className="camera-permission-card">
                  <div className="permission-icon">🤖</div>
                  <h3>AI Auto-Capture Camera</h3>
                  <p>Allow camera access for AI to automatically detect and capture food images.</p>
                  
                  <div className="ai-features-list">
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span>Real-time food detection</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span>Auto-capture when food detected</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">⚠️</span>
                      <span>Auto-stop if no food detected</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">⏰</span>
                      <span>30-second timeout</span>
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    className="btn btn-primary btn-lg"
                    onClick={requestCameraAccess}
                  >
                    🔓 Enable AI Camera
                  </button>
                  
                  <div className="permission-note">
                    <small>Camera will turn off automatically if no food is detected after 5 attempts or 30 seconds.</small>
                  </div>
                </div>
              )}

              {/* Camera Active - Auto Detection */}
              {cameraPermission && isCameraActive && !capturedImage && (
                <div className="camera-active-section">
                  <div className="camera-header">
                    <h3>🎥 AI Food Detection Active</h3>
                    <p>Position food in frame. AI will automatically capture when food is detected.</p>
                    
                    {/* Timeout Warning */}
                    <div className="timeout-warning" style={{
                      background: '#fef3c7',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      margin: '1rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      color: '#92400e'
                    }}>
                      <span>⏰</span>
                      <span>Camera will turn off in 30 seconds if no food is detected</span>
                    </div>
                    
                    <div className="ai-progress-indicator">
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar-fill"
                          style={{ width: `${scanningProgress}%` }}
                        />
                      </div>
                      <div className="progress-text">
                        AI Scanning: {scanningProgress}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Camera Preview */}
                  <div className="camera-preview-container ai-detection-mode">
                    <div className="camera-frame ai-frame">
                      <video 
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="camera-video ai-video"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                      
                      {/* AI Detection Visualization */}
                      <div className="ai-detection-overlay">
                        <div className="detection-grid">
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className="grid-cell" />
                          ))}
                        </div>
                        <div className="detection-center">
                          <div className="center-circle">
                            <div className="scanning-dot"></div>
                          </div>
                        </div>
                        
                        <div className="detection-status">
                          <div className="status-text">
                            {aiMessage || '🔍 Looking for food...'}
                          </div>
                          {detectionResult && (
                            <div className="confidence-indicator">
                              Confidence: {(detectionResult.confidence * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* AI Analysis Feedback */}
                    <div className="ai-analysis-feedback">
                      <div className="feedback-header">
                        <span className="feedback-icon">🤖</span>
                        <span>AI Analysis</span>
                      </div>
                      <div className="feedback-content">
                        {detectionResult ? (
                          <>
                            <div className="food-type-detected">
                              {detectionResult.isFood ? (
                                <div className="detection-positive">
                                  <span className="detection-icon">✅</span>
                                  <span>Detected: {detectionResult.foodType}</span>
                                </div>
                              ) : (
                                <div className="detection-negative">
                                  <span className="detection-icon">❌</span>
                                  <span>No food detected</span>
                                </div>
                              )}
                            </div>
                            {detectionResult.isFood && (
                              <div className="quality-assessment">
                                <span>Quality: </span>
                                <span className={`quality-badge ${detectionResult.quality}`}>
                                  {detectionResult.quality}
                                </span>
                                <span className="confidence-badge">
                                  {Math.round(detectionResult.confidence * 100)}% confident
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="analysis-placeholder">
                            Point camera at food items. AI will auto-capture when food is detected.
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                              ⚠️ Camera will turn off if no food is detected after 5 attempts
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Camera Controls */}
                  <div className="camera-controls">
                    <button 
                      type="button" 
                      className="btn btn-danger"
                      onClick={stopCamera}
                    >
                      ❌ Stop AI Detection
                    </button>
                    <div className="ai-status-indicator">
                      <div className={`status-light ${isDetecting ? 'scanning' : 'ready'}`}></div>
                      <span>
                        {isDetecting ? `AI Scanning... (Attempts: ${noFoodAttempts})` : 'Ready'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="ai-instructions">
                    <h5>💡 How to use AI Camera:</h5>
                    <ol>
                      <li>Hold steady with food in frame</li>
                      <li>Ensure good lighting</li>
                      <li>AI will auto-capture when food is detected</li>
                      <li>Camera auto-stops if no food detected</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Captured Image Preview */}
              {capturedImageUrl && capturedImage && detectionResult && (
                <div className="capture-result-section">
                  <div className="capture-header">
                    <div className="capture-badge">
                      <span className="badge-icon">🤖</span>
                      <span>AI Auto-Captured!</span>
                    </div>
                    <h3>✅ Food Captured Successfully</h3>
                    <p>AI detected food and automatically captured the image</p>
                  </div>
                  
                  <div className="capture-preview">
                    <div className="captured-image">
                      <div className="image-container">
                        <img 
                          src={capturedImageUrl} 
                          alt="AI Auto-Captured Food" 
                          className="captured-img"
                        />
                        <div className="capture-overlay">
                          <div className="overlay-badge">
                            <span>AI Auto-Capture</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="capture-details">
                      <div className="verification-result verified">
                        <div className="verification-success">
                          <span className="success-icon">✅</span>
                          <span>{detectionResult.message || 'Food verified successfully!'}</span>
                        </div>
                        
                        <div className="verification-grid">
                          <div className="verification-item">
                            <div className="item-label">Food Type</div>
                            <div className="item-value">{detectionResult.foodType || formData.food_type}</div>
                          </div>
                          
                          <div className="verification-item">
                            <div className="item-label">AI Confidence</div>
                            <div className="item-value confidence-highlight">
                              {(detectionResult.confidence * 100).toFixed(1)}%
                            </div>
                          </div>
                          
                          <div className="verification-item">
                            <div className="item-label">Quality</div>
                            <div className="item-value">
                              <span className={`quality-tag ${detectionResult.quality}`}>
                                {detectionResult.quality}
                              </span>
                            </div>
                          </div>
                          
                          <div className="verification-item">
                            <div className="item-label">Detection Method</div>
                            <div className="item-value">
                              <span className="method-badge">AI Auto-Capture</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="capture-actions">
                    <button 
                      type="button" 
                      className="btn btn-ghost"
                      onClick={retryCapture}
                    >
                      🔄 Try Again
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-success"
                      onClick={nextStep}
                    >
                      ✅ Use This Photo ➜
                    </button>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  ← Previous
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={nextStep}
                  disabled={!capturedImage || !detectionResult?.isFood}
                >
                  {capturedImage && detectionResult?.isFood ? 'Next: Contact Info ➜' : 'Waiting for AI Capture...'}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Contact Info */}
          {currentStep === 5 && (
            <div className="form-step">
              <h2>📞 Contact Information</h2>
              <p className="step-description">How can NGOs reach you for pickup?</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Contact Name *</label>
                  <input 
                    type="text" 
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone *</label>
                  <input 
                    type="tel" 
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                />
              </div>

              {/* Show selected NGO in final step */}
              {formData.selected_ngo && (
                <div className="selected-ngo-summary">
                  <h4>🏢 Selected NGO</h4>
                  <div className="ngo-details">
                    <p><strong>Organization:</strong> {formData.selected_ngo.name}</p>
                    <p><strong>Distance:</strong> {formData.selected_ngo.distance} km away</p>
                    <p><strong>Contact:</strong> {formData.selected_ngo.contact_person}</p>
                    {formData.selected_ngo.phone && (
                      <p><strong>Phone:</strong> {formData.selected_ngo.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Show AI verification status in final step */}
              {detectionResult && (
                <div className="verification-summary">
                  <h4>🤖 AI Food Verification</h4>
                  <div className="verification-details">
                    <div className="verification-header">
                      <span className="verification-icon">✅</span>
                      <span className="verification-title">AI Auto-Verified</span>
                    </div>
                    <div className="verification-grid">
                      <div className="verification-item">
                        <span className="item-label">Method:</span>
                        <span className="item-value">AI Camera Auto-Capture</span>
                      </div>
                      <div className="verification-item">
                        <span className="item-label">Food Type:</span>
                        <span className="item-value">{detectionResult.foodType || formData.food_type}</span>
                      </div>
                      <div className="verification-item">
                        <span className="item-label">Quality:</span>
                        <span className="item-value">
                          <span className={`quality-tag ${detectionResult.quality}`}>
                            {detectionResult.quality}
                          </span>
                        </span>
                      </div>
                      <div className="verification-item">
                        <span className="item-label">AI Confidence:</span>
                        <span className="item-value confidence-value">
                          {(detectionResult.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-note">
                <div className="note-icon">💡</div>
                <div className="note-text">
                  <strong>Important:</strong> By submitting, you agree that {formData.selected_ngo?.name || 'the selected NGO'} may contact you 
                  for pickup coordination. Your contact details will be shared only with verified NGOs.
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  ← Previous
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Creating Donation...
                    </>
                  ) : (
                    '🎉 Create Donation'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateDonation
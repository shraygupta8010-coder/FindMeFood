import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    aadhaar_number: '', // Added Aadhaar field
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [success, setSuccess] = useState('')
  
  const navigate = useNavigate()
  const { register } = useAuth()

  // Auto-detect location function
  const detectLocation = () => {
    setDetectingLocation(true)
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      setDetectingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Use OpenStreetMap Nominatim API for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          )
          
          const data = await response.json()
          
          if (data && data.address) {
            const address = data.address
            setFormData(prev => ({
              ...prev,
              address: {
                street: address.road || address.neighbourhood || '',
                city: address.city || address.town || address.village || '',
                state: address.state || '',
                pincode: address.postcode || ''
              }
            }))
            setError('')
          }
        } catch (error) {
          console.error('Location detection error:', error)
          setError('Failed to detect location. Please enter manually.')
        } finally {
          setDetectingLocation(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setError('Location access denied. Please enter address manually.')
        setDetectingLocation(false)
      }
    )
  }

  // Real-time field validation
  const validateField = (name, value) => {
    const errors = { ...validationErrors }
    
    switch (name) {
      case 'full_name':
        if (!value.trim()) {
          errors.full_name = 'Full name is required'
        } else if (value.trim().length < 2) {
          errors.full_name = 'Name must be at least 2 characters'
        } else if (!/^[a-zA-Z\s]{2,}$/.test(value.trim())) {
          errors.full_name = 'Name can only contain letters and spaces'
        } else {
          delete errors.full_name
        }
        break
        
      case 'email':
        if (!value) {
          errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address'
        } else {
          delete errors.email
        }
        break
        
      case 'phone':
        if (!value) {
          errors.phone = 'Phone number is required'
        } else if (!/^[6-9]\d{9}$/.test(value.replace(/\D/g, ''))) {
          errors.phone = 'Please enter a valid 10-digit Indian phone number'
        } else {
          delete errors.phone
        }
        break
        
      case 'aadhaar_number': // Added Aadhaar validation
        if (value && !/^\d{12}$/.test(value)) {
          errors.aadhaar_number = 'Aadhaar number must be 12 digits'
        } else {
          delete errors.aadhaar_number
        }
        break
        
      case 'password':
        if (!value) {
          errors.password = 'Password is required'
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters'
        } else if (!/(?=.*[a-z])/.test(value)) {
          errors.password = 'Password must contain at least one lowercase letter'
        } else if (!/(?=.*[A-Z])/.test(value)) {
          errors.password = 'Password must contain at least one uppercase letter'
        } else if (!/(?=.*\d)/.test(value)) {
          errors.password = 'Password must contain at least one number'
        } else {
          delete errors.password
        }
        break
        
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password'
        } else if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match'
        } else {
          delete errors.confirmPassword
        }
        break
        
      case 'address.street':
        if (value && value.length < 5) {
          errors['address.street'] = 'Street address should be more detailed'
        } else {
          delete errors['address.street']
        }
        break
        
      case 'address.pincode':
        if (value && !/^\d{6}$/.test(value)) {
          errors['address.pincode'] = 'Please enter a valid 6-digit PIN code'
        } else {
          delete errors['address.pincode']
        }
        break
        
      default:
        break
    }
    
    setValidationErrors(errors)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    setError('')
    setSuccess('')
    
    // Validate field in real-time if it's been touched
    if (touchedFields[name]) {
      validateField(name, value)
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }))
    validateField(name, value)
  }

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: '', text: '' }
    
    let strength = 0
    if (password.length >= 6) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
    
    const strengths = {
      1: { strength: 'weak', text: 'Weak password', className: 'strength-weak' },
      2: { strength: 'weak', text: 'Weak password', className: 'strength-weak' },
      3: { strength: 'medium', text: 'Medium strength', className: 'strength-medium' },
      4: { strength: 'strong', text: 'Strong password', className: 'strength-strong' },
      5: { strength: 'strong', text: 'Very strong password', className: 'strength-strong' }
    }
    
    return strengths[strength] || { strength: '', text: '' }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Mark all fields as touched to show all errors
    const allFields = ['full_name', 'email', 'phone', 'password', 'confirmPassword']
    const newTouchedFields = {}
    allFields.forEach(field => {
      newTouchedFields[field] = true
    })
    setTouchedFields(newTouchedFields)
    
    // Validate all fields
    const errors = {}
    allFields.forEach(field => {
      validateField(field, formData[field])
    })
    
    // Check if there are any validation errors
    setTimeout(() => {
      if (Object.keys(validationErrors).length > 0) {
        setError('Please fix the validation errors below')
        return
      }
      
      // If no validation errors, proceed with submission
      submitForm()
    }, 100)
  }

  const submitForm = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const userData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        aadhaar_number: formData.aadhaar_number || null,
        address: formData.address // Send the entire address object
      }

      const result = await register(userData)
      
      if (result.success) {
        setSuccess('Registration successful! Redirecting to dashboard...')
        setTimeout(() => navigate('/dashboard'), 2000)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  // Helper to get address field validation class
  const getAddressFieldClass = (fieldName) => {
    const fullFieldName = `address.${fieldName}`
    if (validationErrors[fullFieldName]) {
      return 'input-error'
    }
    if (touchedFields[fullFieldName] && formData.address[fieldName] && !validationErrors[fullFieldName]) {
      return 'input-success'
    }
    return ''
  }

  return (
    <div className="auth-page">
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
          <Link to="/about">ℹ️ About</Link>
          <Link to="/login">🔐 Login</Link>
        </nav>
      </header>

      {/* Registration Form */}
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '600px' }}>
          <div className="auth-header">
            <div className="auth-icon">👤</div>
            <h2>Create your account</h2>
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-link">Sign in here</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            <div className="form-section">
              <h3>👤 Personal Information</h3>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  className={validationErrors.full_name ? 'input-error' : touchedFields.full_name && formData.full_name ? 'input-success' : ''}
                />
                {validationErrors.full_name && (
                  <div className="error-text">{validationErrors.full_name}</div>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your email"
                    className={validationErrors.email ? 'input-error' : touchedFields.email && formData.email && !validationErrors.email ? 'input-success' : ''}
                  />
                  {validationErrors.email && (
                    <div className="error-text">{validationErrors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your phone number"
                    className={validationErrors.phone ? 'input-error' : touchedFields.phone && formData.phone && !validationErrors.phone ? 'input-success' : ''}
                  />
                  {validationErrors.phone && (
                    <div className="error-text">{validationErrors.phone}</div>
                  )}
                  {!validationErrors.phone && formData.phone && (
                    <div className="validation-hint">✅ Valid phone number</div>
                  )}
                </div>
              </div>

              {/* Aadhaar Number Field */}
              <div className="form-group">
                <label>Aadhaar Number</label>
                <input
                  type="text"
                  name="aadhaar_number"
                  value={formData.aadhaar_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="12-digit Aadhaar number (optional)"
                  maxLength="12"
                  className={validationErrors.aadhaar_number ? 'input-error' : touchedFields.aadhaar_number && formData.aadhaar_number && !validationErrors.aadhaar_number ? 'input-success' : ''}
                />
                {validationErrors.aadhaar_number && (
                  <div className="error-text">{validationErrors.aadhaar_number}</div>
                )}
                {!validationErrors.aadhaar_number && formData.aadhaar_number && (
                  <div className="validation-hint">✅ Valid Aadhaar format</div>
                )}
                {!formData.aadhaar_number && (
                  <div className="helper-text">
                    Optional - for enhanced verification and trust building
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>📍 Address Information</h3>
              
              <div className="form-group">
                <label>Auto-detect Location</label>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={detectingLocation}
                  className="btn btn-ghost"
                  style={{ width: '100%', marginBottom: '1rem' }}
                >
                  {detectingLocation ? (
                    <>
                      <div className="spinner"></div>
                      Detecting Location...
                    </>
                  ) : (
                    '📍 Auto-detect My Location'
                  )}
                </button>
              </div>

              <div className="form-group">
                <label>Street Address</label>
                <textarea
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Your complete street address"
                  rows="2"
                  className={getAddressFieldClass('street')}
                />
                {validationErrors['address.street'] && (
                  <div className="error-text">{validationErrors['address.street']}</div>
                )}
                {touchedFields['address.street'] && formData.address.street && !validationErrors['address.street'] && (
                  <div className="validation-hint">✅ Detailed address provided</div>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="City"
                    className={getAddressFieldClass('city')}
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="State"
                    className={getAddressFieldClass('state')}
                  />
                </div>

                <div className="form-group">
                  <label>PIN Code</label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="6-digit PIN code"
                    maxLength="6"
                    className={getAddressFieldClass('pincode')}
                  />
                  {validationErrors['address.pincode'] && (
                    <div className="error-text">{validationErrors['address.pincode']}</div>
                  )}
                  {touchedFields['address.pincode'] && formData.address.pincode && !validationErrors['address.pincode'] && (
                    <div className="validation-hint">✅ Valid PIN code</div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>🔒 Security</h3>
              
              <div className="form-group">
                <label>Password *</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your password (min. 6 characters)"
                    minLength="6"
                    className={validationErrors.password ? 'input-error' : touchedFields.password && formData.password && !validationErrors.password ? 'input-success' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {validationErrors.password && (
                  <div className="error-text">{validationErrors.password}</div>
                )}
                {formData.password && !validationErrors.password && (
                  <div className={`password-strength ${passwordStrength.className}`}>
                    🔒 {passwordStrength.text}
                  </div>
                )}
                {!formData.password && (
                  <div className="validation-hint">
                    Must contain: uppercase, lowercase, number, and be at least 6 characters
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm your password"
                    className={validationErrors.confirmPassword ? 'input-error' : touchedFields.confirmPassword && formData.confirmPassword && !validationErrors.confirmPassword ? 'input-success' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <div className="error-text">{validationErrors.confirmPassword}</div>
                )}
                {formData.confirmPassword && !validationErrors.confirmPassword && (
                  <div className="validation-hint">✅ Passwords match</div>
                )}
              </div>
            </div>

            <div className="form-note">
              <div className="note-icon">💡</div>
              <div className="note-text">
                <strong>Aadhaar Verification:</strong> Providing Aadhaar helps us verify your identity and build trust in our community. 
                Your Aadhaar data is securely stored and never shared with third parties. Your address helps us connect you with nearby NGOs for faster food pickup.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0}
              className="btn btn-primary auth-btn"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Are you an NGO?</span>
          </div>

          <Link to="/ngo/register" className="btn btn-ghost ngo-btn">
            Register as NGO
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
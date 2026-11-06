import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

const NgoRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    contact_person: '',
    website: '',
    registration_number: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})
  
  const navigate = useNavigate()

  // Real-time field validation
  const validateField = (name, value) => {
    const errors = { ...validationErrors }
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Organization name is required'
        } else if (value.trim().length < 2) {
          errors.name = 'Organization name must be at least 2 characters'
        } else {
          delete errors.name
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
        if (value && !/^[6-9]\d{9}$/.test(value.replace(/\D/g, ''))) {
          errors.phone = 'Please enter a valid 10-digit Indian phone number'
        } else {
          delete errors.phone
        }
        break
        
      case 'contact_person':
        if (!value.trim()) {
          errors.contact_person = 'Contact person name is required'
        } else if (value.trim().length < 2) {
          errors.contact_person = 'Contact person name must be at least 2 characters'
        } else {
          delete errors.contact_person
        }
        break
        
      case 'website':
        if (value && !/^https?:\/\/.+\..+/.test(value)) {
          errors.website = 'Please enter a valid website URL (include http:// or https://)'
        } else {
          delete errors.website
        }
        break
        
      case 'address.street':
        if (value && value.length < 5) {
          errors['address.street'] = 'Street address should be more detailed'
        } else {
          delete errors['address.street']
        }
        break
        
      case 'address.city':
        if (value && value.length < 2) {
          errors['address.city'] = 'Please enter a valid city name'
        } else {
          delete errors['address.city']
        }
        break
        
      case 'address.state':
        if (value && value.length < 2) {
          errors['address.state'] = 'Please enter a valid state name'
        } else {
          delete errors['address.state']
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Mark all required fields as touched to show all errors
    const requiredFields = ['name', 'email', 'contact_person']
    const newTouchedFields = { ...touchedFields }
    requiredFields.forEach(field => {
      newTouchedFields[field] = true
    })
    setTouchedFields(newTouchedFields)
    
    // Validate all required fields
    const errors = {}
    requiredFields.forEach(field => {
      validateField(field, formData[field])
    })
    
    // Check if there are any validation errors
    setTimeout(() => {
      if (Object.keys(validationErrors).length > 0) {
        setError('Please fix the validation errors below')
        return
      }
      
      // Check required fields are filled
      if (!formData.name || !formData.email || !formData.contact_person) {
        setError('Please fill in all required fields')
        return
      }
      
      // If no validation errors, proceed with submission
      submitForm()
    }, 100)
  }

  const submitForm = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/ngo/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        // Show success message and redirect to login
        alert('🎉 NGO registered successfully! You can now login.')
        navigate('/login')
      } else {
        setError(result.message || 'Registration failed')
      }
    } catch (error) {
      setError('Registration failed. Please check your connection and try again.')
      console.error('NGO registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check if form is valid for button enabling
  const isFormValid = () => {
    const requiredFields = ['name', 'email', 'contact_person']
    const hasRequiredFields = requiredFields.every(field => 
      formData[field] && formData[field].trim().length >= 2
    )
    
    const hasEmailError = validationErrors.email
    const hasNameError = validationErrors.name
    const hasContactError = validationErrors.contact_person
    
    return hasRequiredFields && !hasEmailError && !hasNameError && !hasContactError
  }

  // Helper to get field validation class
  const getFieldClass = (fieldName) => {
    if (validationErrors[fieldName]) {
      return 'input-error'
    }
    if (touchedFields[fieldName] && formData[fieldName] && !validationErrors[fieldName]) {
      return 'input-success'
    }
    return ''
  }

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

      {/* NGO Registration Form */}
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '600px' }}>
          <div className="auth-header">
            <div className="auth-icon">🏢</div>
            <h2>Register Your NGO</h2>
            <p>
              Join FindMeFood to receive food donations and help your community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Organization Details */}
            <div className="form-section">
              <h3>🏢 Organization Details</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Organization Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your NGO name"
                    className={getFieldClass('name')}
                  />
                  {validationErrors.name && (
                    <div className="error-text">{validationErrors.name}</div>
                  )}
                  {touchedFields.name && formData.name && !validationErrors.name && (
                    <div className="validation-hint">✅ Valid organization name</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter organization email"
                    className={getFieldClass('email')}
                  />
                  {validationErrors.email && (
                    <div className="error-text">{validationErrors.email}</div>
                  )}
                  {touchedFields.email && formData.email && !validationErrors.email && (
                    <div className="validation-hint">✅ Valid email format</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Organization Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Describe your NGO's mission and work"
                  rows="3"
                />
                <div className="char-counter">
                  {formData.description.length}/500 characters
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Organization phone number"
                    className={getFieldClass('phone')}
                  />
                  {validationErrors.phone && (
                    <div className="error-text">{validationErrors.phone}</div>
                  )}
                  {touchedFields.phone && formData.phone && !validationErrors.phone && (
                    <div className="validation-hint">✅ Valid phone number</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="https://example.com"
                    className={getFieldClass('website')}
                  />
                  {validationErrors.website && (
                    <div className="error-text">{validationErrors.website}</div>
                  )}
                  {touchedFields.website && formData.website && !validationErrors.website && (
                    <div className="validation-hint">✅ Valid website URL</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="NGO registration number (if any)"
                />
                {formData.registration_number && (
                  <div className="validation-hint">✅ Registration number provided</div>
                )}
              </div>
            </div>

            {/* Contact Person */}
            <div className="form-section">
              <h3>👤 Contact Person</h3>
              
              <div className="form-group">
                <label>Contact Person Name *</label>
                <input
                  type="text"
                  name="contact_person"
                  required
                  value={formData.contact_person}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Name of the primary contact person"
                  className={getFieldClass('contact_person')}
                />
                {validationErrors.contact_person && (
                  <div className="error-text">{validationErrors.contact_person}</div>
                )}
                {touchedFields.contact_person && formData.contact_person && !validationErrors.contact_person && (
                  <div className="validation-hint">✅ Valid contact person name</div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="form-section">
              <h3>📍 Organization Address</h3>
              
              <div className="form-group">
                <label>Street Address</label>
                <textarea
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Full street address"
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
                  {validationErrors['address.city'] && (
                    <div className="error-text">{validationErrors['address.city']}</div>
                  )}
                  {touchedFields['address.city'] && formData.address.city && !validationErrors['address.city'] && (
                    <div className="validation-hint">✅ City provided</div>
                  )}
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
                  {validationErrors['address.state'] && (
                    <div className="error-text">{validationErrors['address.state']}</div>
                  )}
                  {touchedFields['address.state'] && formData.address.state && !validationErrors['address.state'] && (
                    <div className="validation-hint">✅ State provided</div>
                  )}
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

            <div className="form-note">
              <div className="note-icon">💡</div>
              <div className="note-text">
                <strong>Important:</strong> After registration, our team will verify your NGO details. 
                Once verified, you'll be able to receive and manage food donations.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="btn btn-primary auth-btn"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Registering NGO...
                </>
              ) : (
                'Register NGO'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Are you an individual?</span>
          </div>

          <Link to="/register" className="btn btn-ghost">
            Register as Individual
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NgoRegister
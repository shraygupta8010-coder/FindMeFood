import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})
  
  const navigate = useNavigate()
  const { login } = useAuth()

  // Real-time field validation
  const validateField = (name, value) => {
    const errors = { ...validationErrors }
    
    switch (name) {
      case 'email':
        if (!value) {
          errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address'
        } else {
          delete errors.email
        }
        break
        
      case 'password':
        if (!value) {
          errors.password = 'Password is required'
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters'
        } else {
          delete errors.password
        }
        break
        
      default:
        break
    }
    
    setValidationErrors(errors)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
    
    // Mark all fields as touched to show all errors
    const allFields = ['email', 'password']
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

    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.message || 'Invalid email or password')
      }
    } catch (error) {
      setError('Login failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Check if form is valid for button enabling
  const isFormValid = () => {
    return formData.email && 
           formData.password && 
           formData.password.length >= 6 &&
           Object.keys(validationErrors).length === 0
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
          <Link to="/certifications">🏆 Certifications</Link>
          <Link to="/contact">📞 Contact</Link>
        </nav>
      </header>

      {/* Login Form */}
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">🔐</div>
            <h2>Sign in to your account</h2>
            <p>
              Or{' '}
              <Link to="/register" className="text-link">create a new account</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Email address *</label>
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
              {touchedFields.email && formData.email && !validationErrors.email && (
                <div className="validation-hint">✅ Valid email format</div>
              )}
            </div>

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
                  placeholder="Enter your password"
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
              {touchedFields.password && formData.password && !validationErrors.password && (
                <div className="validation-hint">
                  ✅ {formData.password.length >= 8 ? 'Strong password' : 'Password meets requirements'}
                </div>
              )}
              {!formData.password && (
                <div className="validation-hint">
                  Password must be at least 6 characters long
                </div>
              )}
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="checkbox"
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="btn btn-primary auth-btn"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Are you an NGO?</span>
          </div>

          <Link to="/ngo/register" className="btn btn-ghost ngo-btn">
            Register as NGO
          </Link>

          <div className="auth-footer">
            <p>
              Demo Credentials?{' '}
              <span className="demo-hint">
                Use any valid email and password (min 6 chars)
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { userService } from '../../service/userService'
import AadhaarUpload from '../../components/AadhaarUpload'
import AadhaarStatus from '../../components/AadhaarStatus'
import './Profile.css'

const Profile = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAadhaarUpload, setShowAadhaarUpload] = useState(false)
  
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const result = await userService.getProfile()
      if (result.success) {
        setProfile(result.data.profile)
      }
    } catch (error) {
      setError('Failed to load profile')
      console.error('Profile fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const result = await userService.updateProfile(profile)
      if (result.success) {
        setSuccess('Profile updated successfully!')
        fetchUserProfile()
      } else {
        setError(result.message || 'Failed to update profile')
      }
    } catch (error) {
      setError('Error updating profile')
      console.error('Profile update error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
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
            <Link to="/profile" className="active">👤 Profile</Link>
            <button className="btn btn-ghost" onClick={logout}>🚪 Logout</button>
          </nav>
        </header>
        <div className="profile-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            Loading profile...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
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
          <Link to="/profile" className="active">👤 Profile</Link>
          <button className="btn btn-ghost" onClick={logout}>🚪 Logout</button>
        </nav>
      </header>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h1>👤 Your Profile</h1>
            <p>Manage your personal information and settings</p>
          </div>

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

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3>📝 Personal Information</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={profile.full_name || ''}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profile.email || user?.email || ''}
                    disabled
                    className="disabled-input"
                    placeholder="Your email"
                  />
                  <div className="field-note">Email cannot be changed</div>
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  required
                />
              </div>
            </div>

            {/* Identity Verification Section */}
            <div className="profile-section">
              <h3>🆔 Identity Verification</h3>
              
              {/* Aadhaar Status Component */}
              <AadhaarStatus />
              
              {/* Aadhaar Upload Component */}
              <AadhaarUpload 
                onUploadComplete={() => {
                  // Refresh profile data after upload
                  fetchUserProfile();
                }} 
              />

              {/* Legacy Aadhaar Verification Status Display (optional - can be removed if using only components) */}
              {profile.aadhaar_verification_status === 'verified' && (
                <div className="verification-status verified">
                  <div className="status-icon">✅</div>
                  <div className="status-content">
                    <strong>Aadhaar Verified</strong>
                    <p>Your identity has been successfully verified</p>
                  </div>
                </div>
              )}
              
              {profile.aadhaar_verification_status === 'pending' && (
                <div className="verification-status pending">
                  <div className="status-icon">⏳</div>
                  <div className="status-content">
                    <strong>Verification Pending</strong>
                    <p>Your Aadhaar verification is under review</p>
                  </div>
                </div>
              )}
              
              {profile.aadhaar_verification_status === 'rejected' && (
                <div className="verification-status rejected">
                  <div className="status-icon">❌</div>
                  <div className="status-content">
                    <strong>Verification Rejected</strong>
                    <p>Please upload clear images and try again</p>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowAadhaarUpload(true)}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
              
              {(!profile.aadhaar_number || profile.aadhaar_verification_status === 'not_provided') && (
                <div className="verification-status not-provided">
                  <div className="status-icon">📝</div>
                  <div className="status-content">
                    <strong>Aadhaar Not Provided</strong>
                    <p>Add Aadhaar for enhanced verification and trust</p>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowAadhaarUpload(true)}
                    >
                      Add Aadhaar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>📍 Address Information</h3>
              
              <div className="form-group">
                <label>Street Address</label>
                <textarea
                  name="address"
                  value={profile.address || ''}
                  onChange={handleChange}
                  placeholder="Your complete address"
                  rows="3"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={profile.city || ''}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={profile.state || ''}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>

                <div className="form-group">
                  <label>PIN Code</label>
                  <input
                    type="text"
                    name="pincode"
                    value={profile.pincode || ''}
                    onChange={handleChange}
                    placeholder="6-digit PIN code"
                    maxLength="6"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate('/dashboard')}
              >
                ← Back to Dashboard
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <div className="spinner"></div>
                    Saving...
                  </>
                ) : (
                  '💾 Save Changes'
                )}
              </button>
            </div>
          </form>

          <div className="profile-stats">
            <h3>📊 Account Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">Member since</div>
                <div className="stat-value">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN') : 'Recently'}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-number">Email Status</div>
                <div className="stat-value">
                  {profile.is_verified ? '✅ Verified' : '🟡 Pending Verification'}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-number">Account Type</div>
                <div className="stat-value">
                  👤 Food Donor
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-number">Profile Completion</div>
                <div className="stat-value">
                  {profile.full_name && profile.phone ? '✅ Complete' : '⚠️ Incomplete'}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <h3>⚙️ Account Actions</h3>
            <div className="action-buttons">
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/my-donations')}
              >
                📦 View My Donations
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/create-donation')}
              >
                💝 Create New Donation
              </button>
              <button 
                className="btn btn-ghost"
                onClick={logout}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Aadhaar Upload Modal */}
      {showAadhaarUpload && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Aadhaar Verification</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAadhaarUpload(false)}
              >
                ×
              </button>
            </div>
            <AadhaarUpload 
              onUploadComplete={(data) => {
                setShowAadhaarUpload(false);
                // Update profile data
                setProfile(prev => ({
                  ...prev,
                  aadhaar_number: data.aadhaar_number,
                  aadhaar_verification_status: 'pending'
                }));
              }}
              currentAadhaar={profile.aadhaar_number}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
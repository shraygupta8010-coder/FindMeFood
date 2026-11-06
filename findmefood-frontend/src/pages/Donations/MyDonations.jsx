import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { donationService } from '../../service/donationService'
import './MyDonations.css'

const MyDonations = () => {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, pending, accepted, completed, cancelled
  
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    fetchMyDonations()
  }, [])

  const fetchMyDonations = async () => {
    try {
      setLoading(true)
      const result = await donationService.getMyDonations()
      if (result.success) {
        setDonations(result.data.donations)
      } else {
        setError('Failed to load donations')
      }
    } catch (error) {
      setError('Error loading donations')
      console.error('Donations fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b' // yellow
      case 'accepted': return '#3b82f6' // blue
      case 'picked_up': return '#8b5cf6' // purple
      case 'completed': return '#10b981' // green
      case 'cancelled': return '#ef4444' // red
      default: return '#6b7280' // gray
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '🕒 Pending'
      case 'accepted': return '✅ Accepted'
      case 'picked_up': return '🚚 Picked Up'
      case 'completed': return '🎉 Completed'
      case 'cancelled': return '❌ Cancelled'
      default: return status
    }
  }

  const filteredDonations = donations.filter(donation => {
    if (filter === 'all') return true
    return donation.status === filter
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="my-donations-page">
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
            <Link to="/my-donations" className="active">📦 My Donations</Link>
            <Link to="/create-donation">💝 Create Donation</Link>
          </nav>
        </header>
        <div className="donations-container">
          <div className="loading-spinner">Loading your donations...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-donations-page">
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
          <Link to="/my-donations" className="active">📦 My Donations</Link>
          <Link to="/create-donation">💝 Create Donation</Link>
        </nav>
      </header>

      <div className="donations-container">
        <div className="donations-header">
          <h1>📦 My Donations</h1>
          <p>Track your food donations and their status</p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {[
            { key: 'all', label: 'All', count: donations.length },
            { key: 'pending', label: 'Pending', count: donations.filter(d => d.status === 'pending').length },
            { key: 'accepted', label: 'Accepted', count: donations.filter(d => d.status === 'accepted').length },
            { key: 'completed', label: 'Completed', count: donations.filter(d => d.status === 'completed').length },
            { key: 'cancelled', label: 'Cancelled', count: donations.filter(d => d.status === 'cancelled').length }
          ].map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchMyDonations} className="retry-btn">
              🔄 Retry
            </button>
          </div>
        )}

        {/* Donations List */}
        <div className="donations-list">
          {filteredDonations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No donations found</h3>
              <p>
                {filter === 'all' 
                  ? "You haven't created any donations yet. Start by creating your first donation!"
                  : `No ${filter} donations found.`
                }
              </p>
              {filter === 'all' && (
                <Link to="/create-donation" className="btn btn-primary">
                  💝 Create Your First Donation
                </Link>
              )}
            </div>
          ) : (
            filteredDonations.map(donation => (
              <div key={donation.id} className="donation-card">
                <div className="donation-header">
                  <div className="donation-info">
                    <h3>{donation.food_type}</h3>
                    <div className="donation-meta">
                      <span className="donation-date">
                        📅 {formatDate(donation.created_at)}
                      </span>
                      {donation.ngo_name && (
                        <span className="ngo-name">
                          🏢 {donation.ngo_name}
                        </span>
                      )}
                      {/* NEW: AI Verification Badge */}
                      {donation.verification_data && (
                        <span className={`verification-badge ${
                          donation.verification_data.isFood ? 'verified' : 'not-verified'
                        }`}>
                          {donation.verification_data.isFood ? '✅ AI Verified' : '❌ Not Food'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(donation.status) }}
                  >
                    {getStatusText(donation.status)}
                  </div>
                </div>

                <div className="donation-details">
                  {donation.food_image_url && (
                    <div className="donation-image">
                      <img src={donation.food_image_url} alt={donation.food_type} />
                    </div>
                  )}
                  
                  <div className="donation-content">
                    {donation.food_source && (
                      <p><strong>Source:</strong> {donation.food_source}</p>
                    )}
                    
                    {donation.location && (
                      <p>
                        <strong>📍 Pickup:</strong>{' '}
                        {typeof donation.location === 'string' 
                          ? JSON.parse(donation.location).address 
                          : donation.location.address
                        }
                      </p>
                    )}

                    {donation.pickup_time && (
                      <p>
                        <strong>⏰ Pickup Time:</strong>{' '}
                        {formatDate(donation.pickup_time)}
                      </p>
                    )}

                    {/* NEW: AI Verification Details */}
                    {donation.verification_data && donation.verification_data.isFood && (
                      <div className="verification-details">
                        <p><strong>🤖 AI Analysis:</strong></p>
                        <div className="verification-info">
                          <span className="verification-type">
                            🍽️ {donation.verification_data.foodType}
                          </span>
                          <span className={`quality-tag ${donation.verification_data.quality}`}>
                            Quality: {donation.verification_data.quality}
                          </span>
                          {donation.verification_data.confidence && (
                            <span className="confidence-score">
                              Confidence: {(donation.verification_data.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        {donation.verification_data.details && donation.verification_data.details.items.length > 0 && (
                          <p className="detected-items">
                            <strong>Detected Items:</strong> {donation.verification_data.details.items.join(', ')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="donation-actions">
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/donations/${donation.id}`)}
                      >
                        👁️ View Details
                      </button>
                      
                      {donation.status === 'pending' && (
                        <button className="btn btn-ghost btn-sm">
                          ✏️ Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-number">{donations.length}</div>
            <div className="stat-label">Total Donations</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {donations.filter(d => d.status === 'completed').length}
            </div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {donations.filter(d => d.status === 'pending' || d.status === 'accepted').length}
            </div>
            <div className="stat-label">In Progress</div>
          </div>
          {/* NEW: AI Verification Stats */}
          <div className="stat-card">
            <div className="stat-number">
              {donations.filter(d => d.verification_data && d.verification_data.isFood).length}
            </div>
            <div className="stat-label">AI Verified</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyDonations
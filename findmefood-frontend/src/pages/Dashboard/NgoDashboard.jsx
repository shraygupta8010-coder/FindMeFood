import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { donationService } from '../../service/donationService'
import './NgoDashboard.css'

const NgoDashboard = () => {
  const [stats, setStats] = useState({})
  const [availableDonations, setAvailableDonations] = useState([])
  const [acceptedDonations, setAcceptedDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch NGO stats
      const statsResult = await donationService.getNGOStats()
      if (statsResult.success) {
        setStats(statsResult.data.stats)
      }

      // Fetch available donations (all pending donations)
      const donationsResult = await donationService.getAllDonations()
      if (donationsResult.success) {
        const pendingDonations = donationsResult.data.donations.filter(
          donation => donation.status === 'pending'
        )
        setAvailableDonations(pendingDonations)
      }

      // Fetch NGO's accepted donations
      const ngoDonationsResult = await donationService.getNGODonations()
      if (ngoDonationsResult.success) {
        setAcceptedDonations(ngoDonationsResult.data.donations)
      }

    } catch (error) {
      setError('Failed to load dashboard data')
      console.error('Dashboard fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptDonation = async (donationId) => {
    try {
      const result = await donationService.updateDonationStatus(donationId, 'accepted', 'NGO accepted the donation')
      
      if (result.success) {
        // Refresh data
        fetchDashboardData()
        alert('✅ Donation accepted successfully!')
      } else {
        alert('❌ Failed to accept donation')
      }
    } catch (error) {
      alert('❌ Error accepting donation')
      console.error('Accept donation error:', error)
    }
  }

  const handleUpdateStatus = async (donationId, newStatus) => {
    try {
      const result = await donationService.updateDonationStatus(donationId, newStatus, `Status updated to ${newStatus}`)
      
      if (result.success) {
        fetchDashboardData()
        alert(`✅ Status updated to ${newStatus}`)
      }
    } catch (error) {
      alert('❌ Error updating status')
      console.error('Update status error:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'accepted': return '#3b82f6'
      case 'picked_up': return '#8b5cf6'
      case 'completed': return '#10b981'
      case 'cancelled': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="ngo-dashboard-page">
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
            <Link to="/ngo-dashboard" className="active">📊 NGO Dashboard</Link>
            <button className="btn btn-ghost" onClick={logout}>🚪 Logout</button>
          </nav>
        </header>
        <div className="dashboard-container">
          <div className="loading-spinner">Loading NGO Dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="ngo-dashboard-page">
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
          <Link to="/ngo-dashboard" className="active">📊 NGO Dashboard</Link>
          <button className="btn btn-ghost" onClick={logout}>🚪 Logout</button>
        </nav>
      </header>

      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-card ngo-welcome">
          <div className="welcome-content">
            <h1>🏢 NGO Dashboard</h1>
            <p>Welcome back! Manage food donations and help your community.</p>
          </div>
          <div className="welcome-illustration">🤝</div>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{stats.total || 0}</div>
              <div className="stat-label">Total Donations</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🕒</div>
            <div className="stat-content">
              <div className="stat-number">{stats.pending || 0}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{stats.accepted || 0}</div>
              <div className="stat-label">Accepted</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎉</div>
            <div className="stat-content">
              <div className="stat-number">{stats.completed || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📈 Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            📦 Available Donations ({availableDonations.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'accepted' ? 'active' : ''}`}
            onClick={() => setActiveTab('accepted')}
          >
            ✅ My Donations ({acceptedDonations.length})
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchDashboardData} className="retry-btn">
              🔄 Retry
            </button>
          </div>
        )}

        {/* Available Donations Tab */}
        {activeTab === 'available' && (
          <div className="tab-content">
            <h2>📦 Available Donations</h2>
            <p>Accept donations to help your community</p>
            
            <div className="donations-grid">
              {availableDonations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3>No available donations</h3>
                  <p>There are no pending donations at the moment.</p>
                </div>
              ) : (
                availableDonations.map(donation => (
                  <div key={donation.id} className="donation-card">
                    <div className="donation-header">
                      <h3>{donation.food_type}</h3>
                      <div className="status-badge" style={{backgroundColor: getStatusColor(donation.status)}}>
                        {donation.status.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="donation-details">
                      <p><strong>👤 Donor:</strong> {donation.donor_name || donation.donor_email}</p>
                      <p><strong>📍 Location:</strong> {donation.location ? JSON.parse(donation.location).address : 'Address not provided'}</p>
                      <p><strong>📅 Posted:</strong> {formatDate(donation.created_at)}</p>
                      
                      {donation.food_source && (
                        <p><strong>🏪 Source:</strong> {donation.food_source}</p>
                      )}
                    </div>

                    <div className="donation-actions">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAcceptDonation(donation.id)}
                      >
                        ✅ Accept Donation
                      </button>
                      <button className="btn btn-ghost btn-sm">
                        👁️ View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Accepted Donations Tab */}
        {activeTab === 'accepted' && (
          <div className="tab-content">
            <h2>✅ My Accepted Donations</h2>
            <p>Manage the donations you've accepted</p>
            
            <div className="donations-grid">
              {acceptedDonations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <h3>No accepted donations</h3>
                  <p>You haven't accepted any donations yet.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('available')}
                  >
                    📦 Browse Available Donations
                  </button>
                </div>
              ) : (
                acceptedDonations.map(donation => (
                  <div key={donation.id} className="donation-card">
                    <div className="donation-header">
                      <h3>{donation.food_type}</h3>
                      <div className="status-badge" style={{backgroundColor: getStatusColor(donation.status)}}>
                        {donation.status.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="donation-details">
                      <p><strong>👤 Donor:</strong> {donation.donor_name || donation.donor_email}</p>
                      <p><strong>📞 Contact:</strong> {donation.donor_phone || 'Not provided'}</p>
                      <p><strong>📍 Location:</strong> {donation.location ? JSON.parse(donation.location).address : 'Address not provided'}</p>
                      <p><strong>📅 Accepted:</strong> {formatDate(donation.created_at)}</p>
                    </div>

                    <div className="donation-actions">
                      {donation.status === 'accepted' && (
                        <>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUpdateStatus(donation.id, 'picked_up')}
                          >
                            🚚 Mark as Picked Up
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleUpdateStatus(donation.id, 'cancelled')}
                          >
                            ❌ Cancel
                          </button>
                        </>
                      )}
                      
                      {donation.status === 'picked_up' && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleUpdateStatus(donation.id, 'completed')}
                        >
                          ✅ Mark as Completed
                        </button>
                      )}

                      {donation.status === 'completed' && (
                        <span className="completed-badge">🎉 Successfully Delivered</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <h2>📈 Quick Overview</h2>
            
            <div className="overview-grid">
              <div className="overview-card">
                <h3>🚀 Quick Actions</h3>
                <div className="action-buttons">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('available')}
                  >
                    📦 Browse Donations
                  </button>
                  <button 
                    className="btn btn-ghost"
                    onClick={() => setActiveTab('accepted')}
                  >
                    ✅ Manage Accepted
                  </button>
                </div>
              </div>

              <div className="overview-card">
                <h3>📊 Recent Activity</h3>
                {acceptedDonations.slice(0, 3).map(donation => (
                  <div key={donation.id} className="activity-item">
                    <div className="activity-icon">✅</div>
                    <div className="activity-content">
                      <div className="activity-title">Accepted {donation.food_type}</div>
                      <div className="activity-time">{formatDate(donation.created_at)}</div>
                    </div>
                  </div>
                ))}
                {acceptedDonations.length === 0 && (
                  <p className="no-activity">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NgoDashboard
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Dashboard.css'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="dashboard-page">
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
          <Link to="/dashboard" className="active">📊 Dashboard</Link>
          <Link to="/my-donations">📦 My Donations</Link>
          <Link to="/profile">👤 Profile</Link>
          <button className="btn btn-ghost" onClick={handleLogout}>🚪 Logout</button>
        </nav>
      </header>

      {/* Dashboard Content */}
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-card">
          <div className="welcome-content">
            <h1>Welcome back, {user?.full_name || user?.email || 'User'}! 👋</h1>
            <p>Ready to make a difference today? Share your surplus food and help fight hunger.</p>
          </div>
          <div className="welcome-illustration">🌍❤️</div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">12</div>
              <div className="stat-label">Total Donations</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">8</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-number">3</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">45+</div>
              <div className="stat-label">People Helped</div>
            </div>
          </div>
        </div>

        {/* Quick Actions - UPDATED TO SINGLE LINE */}
        <div className="actions-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link to="/create-donation" className="quick-action-card">
              <div className="quick-action-icon">🎁</div>
              <div className="quick-action-content">
                <h3>Create Donation</h3>
                <p>Share your surplus food with those in need</p>
              </div>
              <div className="quick-action-arrow">➜</div>
            </Link>
            
            <Link to="/my-donations" className="quick-action-card">
              <div className="quick-action-icon">📦</div>
              <div className="quick-action-content">
                <h3>My Donations</h3>
                <p>Track your donation history and status</p>
              </div>
              <div className="quick-action-arrow">➜</div>
            </Link>
            
            <Link to="/nearby-ngos" className="quick-action-card">
              <div className="quick-action-icon">📍</div>
              <div className="quick-action-content">
                <h3>Nearby NGOs</h3>
                <p>Find certified organizations near you</p>
              </div>
              <div className="quick-action-arrow">➜</div>
            </Link>
            
            <Link to="/certifications" className="quick-action-card">
              <div className="quick-action-icon">🏆</div>
              <div className="quick-action-content">
                <h3>Certifications</h3>
                <p>View our government certifications</p>
              </div>
              <div className="quick-action-arrow">➜</div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-content">
                <div className="activity-title">Donation Completed</div>
                <div className="activity-desc">5kg rice delivered to Hope Foundation</div>
                <div className="activity-time">2 hours ago</div>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">🚚</div>
              <div className="activity-content">
                <div className="activity-title">Pickup Scheduled</div>
                <div className="activity-desc">Vegetables scheduled for tomorrow 3 PM</div>
                <div className="activity-time">5 hours ago</div>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">📸</div>
              <div className="activity-content">
                <div className="activity-title">Food Verified</div>
                <div className="activity-desc">Your uploaded food images were approved</div>
                <div className="activity-time">1 day ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
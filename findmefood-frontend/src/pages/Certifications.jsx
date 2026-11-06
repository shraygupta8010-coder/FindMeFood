import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Certifications.css'

const Certifications = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Sample certifications data
  const certifications = [
    {
      id: 1,
      title: "Food Safety Certified",
      issuer: "Food Safety and Standards Authority of India (FSSAI)",
      description: "Certified for safe food handling and distribution practices",
      icon: "🛡️",
      date: "2024",
      validity: "Valid until Dec 2025",
      badge: "gold"
    },
    {
      id: 2,
      title: "NGO Partnership Verified",
      issuer: "Ministry of Social Justice & Empowerment",
      description: "Verified partner for food distribution initiatives",
      icon: "🤝",
      date: "2024",
      validity: "Annual renewal",
      badge: "blue"
    },
    {
      id: 3,
      title: "Digital India Certified",
      issuer: "Government of India",
      description: "Recognized digital platform for social initiatives",
      icon: "💻",
      date: "2024",
      validity: "Permanent",
      badge: "green"
    },
    {
      id: 4,
      title: "Data Security Certified",
      issuer: "Data Security Council of India",
      description: "ISO 27001 compliant data protection standards",
      icon: "🔒",
      date: "2024",
      validity: "Valid until Nov 2025",
      badge: "purple"
    }
  ]

  const partners = [
    {
      name: "Robin Hood Army",
      logo: "🏹",
      type: "Food Redistribution",
      since: "2023"
    },
    {
      name: "Feeding India",
      logo: "🍛",
      type: "Hunger Relief",
      since: "2024"
    },
    {
      name: "No Food Waste",
      logo: "🚫",
      type: "Food Recovery",
      since: "2023"
    },
    {
      name: "Akshaya Patra",
      logo: "🍽️",
      type: "Mid-day Meals",
      since: "2024"
    }
  ]

  const stats = [
    { 
      number: "50,000+", 
      label: "Meals Distributed",
      icon: "🍛",
      sticker: "🌟",
      color: "#FF6B6B",
      description: "Nutritious meals served to those in need"
    },
    { 
      number: "200+", 
      label: "Partner NGOs",
      icon: "🤝",
      sticker: "🚀",
      color: "#4ECDC4",
      description: "Verified organizations working with us"
    },
    { 
      number: "15+", 
      label: "Cities Covered",
      icon: "🏙️",
      sticker: "🌍",
      color: "#45B7D1",
      description: "Across major Indian cities and growing"
    },
    { 
      number: "10,000+", 
      label: "Lives Impacted",
      icon: "❤️",
      sticker: "✨",
      color: "#96CEB4",
      description: "People whose lives we've touched"
    }
  ]

  return (
    <div className="certifications-page">
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
          <Link to="/certifications" className="active">🏆 Certifications</Link>
        </nav>
      </header>

      <div className="certifications-container">
        {/* Hero Section */}
        <div className="certifications-hero">
          <div className="hero-content">
            <h1>🏆 Our Certifications & Trust</h1>
            <p>Transparent, verified, and committed to making a difference</p>
            <div className="trust-badges">
              <span className="trust-badge">🔒 Secure</span>
              <span className="trust-badge">✅ Verified</span>
              <span className="trust-badge">🌱 Transparent</span>
            </div>
          </div>
        </div>

        {/* Enhanced Impact Stats */}
        <div className="impact-stats">
          <h2>🌟 Our Impact in Numbers</h2>
          <p className="impact-subtitle">Making a real difference, one meal at a time</p>
          
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item" style={{ '--stat-color': stat.color }}>
                <div className="stat-decoration">
                  <div className="stat-sticker">{stat.sticker}</div>
                  <div className="stat-ribbon">Impact</div>
                </div>
                <div className="stat-main">
                  <div className="stat-icon-wrapper">
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-pulse"></div>
                  </div>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-description">{stat.description}</div>
                </div>
                <div className="stat-sparkles">
                  <span className="sparkle">✨</span>
                  <span className="sparkle">✨</span>
                  <span className="sparkle">✨</span>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="impact-progress">
            <div className="progress-header">
              <h3>🎯 Our Monthly Goal</h3>
              <span className="progress-text">15,000 meals this month</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '75%' }}>
                <div className="progress-glow"></div>
                <span className="progress-percent">75%</span>
              </div>
            </div>
            <div className="progress-stats">
              <span>✅ 11,250 meals served</span>
              <span>🎯 3,750 to go!</span>
            </div>
          </div>
        </div>

        {/* Certifications Grid */}
        <section className="certifications-section">
          <h2>📜 Official Certifications</h2>
          <p>Our platform is certified and recognized by government and regulatory bodies</p>
          
          <div className="certifications-grid">
            {certifications.map(cert => (
              <div key={cert.id} className={`certification-card ${cert.badge}`}>
                <div className="cert-header">
                  <div className="cert-icon">{cert.icon}</div>
                  <div className="cert-badge">{cert.badge}</div>
                </div>
                <h3>{cert.title}</h3>
                <p className="cert-issuer">Issued by: {cert.issuer}</p>
                <p className="cert-desc">{cert.description}</p>
                <div className="cert-meta">
                  <span className="cert-date">📅 {cert.date}</span>
                  <span className="cert-validity">✅ {cert.validity}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* NGO Partners */}
        <section className="partners-section">
          <h2>🤝 Partner NGOs</h2>
          <p>Working together with certified organizations across India</p>
          
          <div className="partners-grid">
            {partners.map((partner, index) => (
              <div key={index} className="partner-card">
                <div className="partner-logo">{partner.logo}</div>
                <h4>{partner.name}</h4>
                <p className="partner-type">{partner.type}</p>
                <div className="partner-since">
                  Partner since {partner.since}
                </div>
                <span className="verified-tag">✅ Verified Partner</span>
              </div>
            ))}
          </div>
        </section>

        {/* Verification Process */}
        <section className="verification-section">
          <h2>🔍 Our Verification Process</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h4>Document Verification</h4>
              <p>All NGOs submit registration documents and licenses for verification</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h4>On-ground Inspection</h4>
              <p>Physical verification of facilities and operations</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h4>Quality Standards Check</h4>
              <p>Food safety and handling standards assessment</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h4>Continuous Monitoring</h4>
              <p>Regular audits and performance reviews</p>
            </div>
          </div>
        </section>

        {/* Trust Message */}
        <section className="trust-message">
          <div className="trust-content">
            <h2>💚 Your Trust is Our Priority</h2>
            <p>
              We maintain the highest standards of transparency and accountability. 
              Every donation is tracked, every meal is accounted for, and every partner 
              is thoroughly verified.
            </p>
            <div className="trust-actions">
              <Link to="/create-donation" className="btn btn-primary">
                💝 Start Donating
              </Link>
              <Link to="/nearby-ngos" className="btn btn-ghost">
                🏢 Find Verified NGOs
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Certifications
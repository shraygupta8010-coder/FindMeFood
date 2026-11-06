// src/pages/Contact/Contact.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { contactService } from '../../service/contactService'
import './Contact.css'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Pre-fill user data if logged in
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.full_name || '',
        email: user.email || ''
      }))
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      const result = await contactService.submitContact(formData)
      if (result.success) {
        setSuccess('Thank you for contacting us! We will get back to you within 24 hours.')
        // Reset form
        setFormData({
          name: user?.full_name || '',
          email: user?.email || '',
          subject: '',
          message: '',
          category: 'general'
        })
      } else {
        setError(result.message || 'Failed to send message')
      }
    } catch (error) {
      setError('Error sending message. Please try again.')
      console.error('Contact form error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="contact-page">
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
          <Link to="/contact" className="active">📞 Contact</Link>
          {user ? (
            <button className="btn btn-ghost" onClick={logout}>🚪 Logout</button>
          ) : (
            <Link to="/login" className="btn btn-primary">🔐 Login</Link>
          )}
        </nav>
      </header>

      <div className="contact-container">
        <div className="contact-card">
          <div className="contact-header">
            <h1>📞 Contact Support</h1>
            <p>We're here to help! Get in touch with our support team</p>
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

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="donation">Donation Issues</option>
                  <option value="ngo">NGO Partnership</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief subject of your message"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Please describe your issue or question in detail..."
                rows="6"
                required
              />
              <div className="char-counter">
                {formData.message.length}/1000 characters
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate(-1)}
              >
                ← Go Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Sending...
                  </>
                ) : (
                  '📤 Send Message'
                )}
              </button>
            </div>
          </form>

          <div className="contact-info">
            <h3>📞 Other Ways to Reach Us</h3>
            <div className="contact-methods">
              <div className="contact-method">
                <div className="method-icon">📧</div>
                <div className="method-content">
                  <h4>Email Support</h4>
                  <p>support@findmefood.org</p>
                  <span>Response time: Within 24 hours</span>
                </div>
              </div>

              <div className="contact-method">
                <div className="method-icon">📞</div>
                <div className="method-content">
                  <h4>Phone Support</h4>
                  <p>+91-1800-123-4567</p>
                  <span>Mon-Fri: 9 AM - 6 PM IST</span>
                </div>
              </div>

              <div className="contact-method">
                <div className="method-icon">💬</div>
                <div className="method-content">
                  <h4>Live Chat</h4>
                  <p>Available on website</p>
                  <span>24/7 automated support</span>
                </div>
              </div>

              <div className="contact-method">
                <div className="method-icon">🏢</div>
                <div className="method-content">
                  <h4>Office Address</h4>
                  <p>FindMeFood HQ, Delhi, India</p>
                  <span>Visit by appointment only</span>
                </div>
              </div>
            </div>
          </div>

          <div className="faq-section">
            <h3>❓ Frequently Asked Questions</h3>
            <div className="faq-list">
              <div className="faq-item">
                <h4>How long does it take to get a response?</h4>
                <p>We typically respond within 24 hours for email inquiries and immediately for urgent issues.</p>
              </div>
              <div className="faq-item">
                <h4>Can I track my support ticket?</h4>
                <p>Yes, you'll receive a ticket number via email that you can use to track your request.</p>
              </div>
              <div className="faq-item">
                <h4>Do you provide emergency support?</h4>
                <p>For urgent donation-related issues, please call our emergency hotline at +91-1800-123-4567.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
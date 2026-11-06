import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header style={{ 
      backgroundColor: 'white', 
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
      borderBottom: '1px solid #e5e7eb' 
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 1rem',
        height: '4rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ 
            width: '2rem', 
            height: '2rem', 
            backgroundColor: '#16a34a', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            ♥
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
            FindMeFood
          </span>
        </Link>

        {/* Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/donations" style={{ color: '#374151', textDecoration: 'none', fontWeight: '500' }}>
            Browse Donations
          </Link>
          <Link to="/ngo" style={{ color: '#374151', textDecoration: 'none', fontWeight: '500' }}>
            For NGOs
          </Link>
          <Link to="/contact" style={{ color: '#374151', textDecoration: 'none', fontWeight: '500' }}>
            📞 Contact
          </Link>
          <Link to="/login" style={{ 
            backgroundColor: '#16a34a', 
            color: 'white', 
            padding: '0.5rem 1rem', 
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '500'
          }}>
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
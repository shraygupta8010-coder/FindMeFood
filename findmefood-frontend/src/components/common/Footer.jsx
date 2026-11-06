import React from 'react'

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: '#1f2937', 
      color: 'white',
      padding: '2rem 1rem'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ 
            width: '1.5rem', 
            height: '1.5rem', 
            backgroundColor: '#22c55e', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            ♥
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>FindMeFood</span>
        </div>
        <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
          Connecting food donors with NGOs to fight hunger
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          © 2024 FindMeFood. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
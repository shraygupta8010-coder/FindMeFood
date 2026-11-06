import React from 'react';
import './NGOSelection.css';

const NGOSelection = ({ 
  nearbyNGOs, 
  loading, 
  selectedNGO, 
  onNGOSelect, 
  onAutoAssign,
  userLocation 
}) => {
  
  const getResponseTime = (distance) => {
    if (distance < 2) return '15-30 min';
    if (distance < 5) return '30-45 min';
    if (distance < 10) return '45-60 min';
    return '60+ min';
  };

  const getRating = (ngo) => {
    // Simulate ratings based on NGO data
    const baseRating = 4.0 + (Math.random() * 1.5); // 4.0 to 5.5
    return Math.min(5.0, baseRating).toFixed(1);
  };

  const getVerifiedStatus = (ngo) => {
    return ngo.verified ? '✅ Verified' : '🔄 Pending Verification';
  };

  if (loading) {
    return (
      <div className="ngo-selection-loading">
        <div className="loading-spinner"></div>
        <p>🔍 Finding nearby NGOs...</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (nearbyNGOs.length === 0) {
    return (
      <div className="no-ngos-found">
        <div className="no-ngos-icon">🏢</div>
        <h3>No NGOs Found Nearby</h3>
        <p>We couldn't find any NGOs within 20km of your location.</p>
        <div className="suggestions">
          <p><strong>Suggestions:</strong></p>
          <ul>
            <li>Try increasing the search radius</li>
            <li>Check if your location is accurate</li>
            <li>Contact support for assistance</li>
          </ul>
        </div>
        <button 
          className="btn btn-ghost"
          onClick={() => window.location.reload()}
        >
          🔄 Retry Search
        </button>
      </div>
    );
  }

  return (
    <div className="ngo-selection-container">
      {/* Header Stats */}
      <div className="ngo-selection-header">
        <div className="stats-card">
          <div className="stat">
            <div className="stat-number">{nearbyNGOs.length}</div>
            <div className="stat-label">NGOs Found</div>
          </div>
          <div className="stat">
            <div className="stat-number">{getResponseTime(nearbyNGOs[0]?.distance || 0)}</div>
            <div className="stat-label">Fastest Response</div>
          </div>
          <div className="stat">
            <div className="stat-number">{nearbyNGOs.filter(n => n.verified).length}</div>
            <div className="stat-label">Verified</div>
          </div>
        </div>
        
        <div className="auto-assign-section">
          <button 
            className="btn btn-primary auto-assign-btn"
            onClick={onAutoAssign}
            disabled={!nearbyNGOs.length}
          >
            ⚡ Auto-assign Closest NGO
          </button>
          <p className="auto-assign-hint">
            We'll assign the NGO closest to your location for fastest pickup
          </p>
        </div>
      </div>

      {/* NGO List */}
      <div className="ngo-list">
        <h3>Available NGOs ({nearbyNGOs.length})</h3>
        <p className="subtitle">Select an NGO to receive your donation</p>
        
        <div className="ngo-cards">
          {nearbyNGOs.map((ngo, index) => (
            <div 
              key={ngo.id}
              className={`ngo-card ${selectedNGO?.id === ngo.id ? 'selected' : ''}`}
              onClick={() => onNGOSelect(ngo)}
            >
              {/* NGO Header */}
              <div className="ngo-header">
                <div className="ngo-avatar">
                  {ngo.name.charAt(0).toUpperCase()}
                </div>
                <div className="ngo-info">
                  <h4 className="ngo-name">{ngo.name}</h4>
                  <div className="ngo-meta">
                    <span className="distance">📍 {ngo.distance} km away</span>
                    <span className="response-time">🕒 {getResponseTime(ngo.distance)}</span>
                  </div>
                </div>
                <div className="ngo-badge">
                  {index === 0 && <span className="closest-badge">🚀 Closest</span>}
                  <span className={`verification-badge ${ngo.verified ? 'verified' : 'pending'}`}>
                    {getVerifiedStatus(ngo)}
                  </span>
                </div>
              </div>

              {/* NGO Details */}
              <div className="ngo-details">
                {ngo.description && (
                  <p className="ngo-description">{ngo.description}</p>
                )}
                
                <div className="ngo-stats">
                  <div className="stat-item">
                    <span className="stat-icon">⭐</span>
                    <span className="stat-value">{getRating(ngo)}</span>
                    <span className="stat-label">Rating</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">📞</span>
                    <span className="stat-value">{ngo.contact_person}</span>
                    <span className="stat-label">Contact</span>
                  </div>
                  {ngo.phone && (
                    <div className="stat-item">
                      <span className="stat-icon">📱</span>
                      <span className="stat-value">{ngo.phone}</span>
                      <span className="stat-label">Phone</span>
                    </div>
                  )}
                </div>

                {ngo.address && (
                  <div className="ngo-address">
                    <span className="address-icon">🏠</span>
                    <span className="address-text">
                      {typeof ngo.address === 'string' ? ngo.address : ngo.address.street || 'Address available'}
                    </span>
                  </div>
                )}
              </div>

              {/* Selection Indicator */}
              <div className="selection-indicator">
                {selectedNGO?.id === ngo.id ? (
                  <div className="selected-indicator">
                    <span className="checkmark">✅</span>
                    <span>Selected</span>
                  </div>
                ) : (
                  <div className="select-prompt">
                    <span>Click to select</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedNGO && (
        <div className="selection-summary">
          <div className="summary-header">
            <h4>✅ NGO Selected</h4>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => onNGOSelect(null)}
            >
              Change
            </button>
          </div>
          <div className="selected-ngo-preview">
            <strong>{selectedNGO.name}</strong>
            <span> • {selectedNGO.distance} km away</span>
            <span> • {getResponseTime(selectedNGO.distance)} response</span>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="ngo-selection-help">
        <div className="help-icon">💡</div>
        <div className="help-content">
          <strong>How NGO selection works:</strong>
          <ul>
            <li>Choose an NGO based on distance and response time</li>
            <li>Verified NGOs have been authenticated by our team</li>
            <li>Auto-assign selects the closest NGO for fastest pickup</li>
            <li>The selected NGO will contact you directly for coordination</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NGOSelection;
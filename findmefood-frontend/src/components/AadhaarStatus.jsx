import React, { useState, useEffect } from 'react';
import { aadhaarService } from '../service/aadhaarService';
import './AadhaarStatus.css';

const AadhaarStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAadhaarStatus();
  }, []);

  const fetchAadhaarStatus = async () => {
    try {
      setLoading(true);
      const result = await aadhaarService.getAadhaarStatus();
      setStatus(result.data);
    } catch (error) {
      console.error('Failed to fetch Aadhaar status:', error);
      setError('Failed to load verification status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return { text: '✅ Verified', color: '#4CAF50', class: 'verified' };
      case 'pending':
        return { text: '⏳ Pending Review', color: '#FF9800', class: 'pending' };
      case 'rejected':
        return { text: '❌ Rejected', color: '#F44336', class: 'rejected' };
      case 'not_submitted':
        return { text: '📝 Not Submitted', color: '#9E9E9E', class: 'not-submitted' };
      default:
        return { text: '❓ Unknown', color: '#9E9E9E', class: 'unknown' };
    }
  };

  if (loading) {
    return (
      <div className="aadhaar-status-loading">
        <div className="spinner"></div>
        <span>Loading verification status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aadhaar-status-error">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <button onClick={fetchAadhaarStatus} className="btn-retry">
          Try Again
        </button>
      </div>
    );
  }

  const statusInfo = getStatusBadge(status?.verification_status);

  return (
    <div className="aadhaar-status">
      <div className="status-header">
        <h3>🆔 Aadhaar Verification Status</h3>
        <button onClick={fetchAadhaarStatus} className="btn-refresh">
          🔄
        </button>
      </div>

      <div className={`status-card ${statusInfo.class}`}>
        <div className="status-badge" style={{ backgroundColor: statusInfo.color }}>
          {statusInfo.text}
        </div>

        {status?.verification && (
          <div className="status-details">
            <div className="detail-row">
              <strong>Aadhaar Number:</strong>
              <span>**** **** {status.verification.aadhaar_number?.slice(-4)}</span>
            </div>
            
            <div className="detail-row">
              <strong>Submitted:</strong>
              <span>{new Date(status.verification.created_at).toLocaleDateString()}</span>
            </div>

            {status.verification.verified_at && (
              <div className="detail-row">
                <strong>Verified:</strong>
                <span>{new Date(status.verification.verified_at).toLocaleDateString()}</span>
              </div>
            )}

            {status.verification.rejection_reason && (
              <div className="detail-row">
                <strong>Rejection Reason:</strong>
                <span className="rejection-reason">{status.verification.rejection_reason}</span>
              </div>
            )}
          </div>
        )}

        {status?.verification_status === 'not_submitted' && (
          <div className="not-submitted-message">
            <p>You haven't submitted Aadhaar for verification yet.</p>
            <p className="helper-text">
              Submit your Aadhaar card images for enhanced account verification and trust.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AadhaarStatus;
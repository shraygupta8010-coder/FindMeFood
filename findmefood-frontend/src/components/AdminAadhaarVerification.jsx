import React, { useState, useEffect } from 'react';
import { aadhaarService } from '../service/aadhaarService';
import './AdminAadhaarVerification.css';

const AdminAadhaarVerification = () => {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  const loadPendingVerifications = async () => {
    try {
      setLoading(true);
      const result = await aadhaarService.getPendingVerifications();
      if (result.success) {
        setPendingVerifications(result.data.verifications);
      }
    } catch (error) {
      setError('Failed to load pending verifications');
      console.error('Load verifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (userId, status, rejectionReason = '') => {
    try {
      setVerifying(userId);
      setError('');
      setSuccess('');

      const result = await aadhaarService.verifyAadhaar(userId, status, rejectionReason);
      
      if (result.success) {
        setSuccess(`Aadhaar ${status} successfully`);
        // Remove from pending list
        setPendingVerifications(prev => 
          prev.filter(verification => verification.user_id !== userId)
        );
        
        if (onVerificationComplete) {
          onVerificationComplete(userId, status);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'status-pending', text: '⏳ Pending' },
      'verified': { class: 'status-verified', text: '✅ Verified' },
      'rejected': { class: 'status-rejected', text: '❌ Rejected' },
      'not_submitted': { class: 'status-not-submitted', text: '📝 Not Submitted' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="admin-verification-panel">
        <div className="loading-spinner">Loading pending verifications...</div>
      </div>
    );
  }

  return (
    <div className="admin-verification-panel">
      <div className="panel-header">
        <h3>🆔 Aadhaar Verification Panel</h3>
        <div className="panel-stats">
          <span className="stat pending">{pendingVerifications.length} Pending</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {pendingVerifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h4>No Pending Verifications</h4>
          <p>All Aadhaar verifications are complete!</p>
        </div>
      ) : (
        <div className="verifications-list">
          {pendingVerifications.map((verification) => (
            <div key={verification.id} className="verification-card">
              <div className="verification-header">
                <div className="user-info">
                  <h4>{verification.full_name || 'Unknown User'}</h4>
                  <p className="user-email">{verification.email}</p>
                  <p className="user-phone">{verification.phone || 'No phone'}</p>
                </div>
                <div className="aadhaar-info">
                  <p><strong>Aadhaar:</strong> {verification.aadhaar_number}</p>
                  <p><strong>Submitted:</strong> {new Date(verification.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="verification-images">
                <div className="image-preview">
                  <label>Front Side</label>
                  {verification.aadhaar_front_image ? (
                    <img 
                      src={verification.aadhaar_front_image} 
                      alt="Aadhaar Front" 
                      className="aadhaar-image"
                    />
                  ) : (
                    <div className="no-image">No front image</div>
                  )}
                </div>
                <div className="image-preview">
                  <label>Back Side</label>
                  {verification.aadhaar_back_image ? (
                    <img 
                      src={verification.aadhaar_back_image} 
                      alt="Aadhaar Back" 
                      className="aadhaar-image"
                    />
                  ) : (
                    <div className="no-image">No back image</div>
                  )}
                </div>
              </div>

              <div className="verification-actions">
                <button
                  onClick={() => handleVerification(verification.user_id, 'verified')}
                  disabled={verifying === verification.user_id}
                  className="btn btn-success"
                >
                  {verifying === verification.user_id ? 'Verifying...' : '✅ Approve'}
                </button>
                
                <div className="reject-section">
                  <input
                    type="text"
                    placeholder="Rejection reason (required)"
                    className="rejection-input"
                    id={`reject-reason-${verification.user_id}`}
                  />
                  <button
                    onClick={() => {
                      const reason = document.getElementById(`reject-reason-${verification.user_id}`).value;
                      if (!reason.trim()) {
                        alert('Please provide a rejection reason');
                        return;
                      }
                      handleVerification(verification.user_id, 'rejected', reason);
                    }}
                    disabled={verifying === verification.user_id}
                    className="btn btn-danger"
                  >
                    {verifying === verification.user_id ? 'Rejecting...' : '❌ Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAadhaarVerification;
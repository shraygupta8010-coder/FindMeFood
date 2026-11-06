import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './OtpVerification.css'; // We'll create this CSS file

const OtpVerification = ({ phone, onVerified, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const { verifyOtp, resendOtp } = useAuth();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!/^\d{6}$/.test(otpValue)) {
      setError('OTP must contain only numbers');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await verifyOtp(phone, otpValue);
      if (result.success) {
        setSuccess('Phone number verified successfully!');
        setTimeout(() => {
          onVerified();
        }, 1500);
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        // Focus first input
        document.getElementById('otp-0').focus();
      }
    } catch (error) {
      setError('OTP verification failed. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await resendOtp(phone);
      if (result.success) {
        setSuccess('New OTP sent to your mobile!');
        setCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0').focus();
      } else {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-verification-container">
      <div className="otp-verification-card">
        <div className="otp-header">
          <div className="otp-icon">📱</div>
          <h2>Verify Your Phone</h2>
          <p>We sent a 6-digit verification code to</p>
          <p className="phone-number">+91 {phone}</p>
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

        <div className="otp-input-group">
          <label>Enter OTP Code</label>
          <div className="otp-inputs">
            {otp.map((data, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleOtpChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.target.select()}
                className="otp-input"
                autoFocus={index === 0}
              />
            ))}
          </div>
        </div>

        <div className="otp-actions">
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="btn btn-primary verify-btn"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>

          <div className="resend-section">
            <p>Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading || !canResend}
              className="btn btn-ghost resend-btn"
            >
              {canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
            </button>
          </div>

          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="btn btn-ghost back-btn"
          >
            ← Back to Registration
          </button>
        </div>

        <div className="otp-help">
          <div className="help-icon">💡</div>
          <div className="help-text">
            <strong>Note:</strong> Check your SMS messages for the OTP. 
            If you don't receive it within 2 minutes, you can request a new one.
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
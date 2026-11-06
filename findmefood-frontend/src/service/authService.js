import api from './api'

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      })

      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
        return response.data
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData)

      if (response.data.success) {
        // AUTO-LOGIN after successful registration (no OTP needed)
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token)
          localStorage.setItem('user', JSON.stringify(response.data.data.user))
        }
        return response.data
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },

  // OTP Verification - KEEP FOR BACKWARD COMPATIBILITY (but make optional)
  async verifyOtp(phone, otp) {
    try {
      const response = await api.post('/auth/verify-otp', {
        phone,
        otp: otp || null // Make OTP optional
      })

      return response.data // Return whatever the backend sends
    } catch (error) {
      console.error('OTP verification error:', error)
      throw error
    }
  },

  // Resend OTP - KEEP FOR BACKWARD COMPATIBILITY
  async resendOtp(phone) {
    try {
      const response = await api.post('/auth/resend-otp', {
        phone
      })

      return response.data // Return whatever the backend sends
    } catch (error) {
      console.error('Resend OTP error:', error)
      throw error
    }
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('token')
  }
}
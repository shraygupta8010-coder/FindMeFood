import React, { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../service/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        authService.logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password)
      setUser(result.data.user)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed'
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      const result = await authService.register(userData)
      
      // Auto-login after successful registration
      if (result.success) {
        setUser(result.data.user)
        // Store token and user data for immediate login
        if (result.data.token) {
          localStorage.setItem('token', result.data.token)
          localStorage.setItem('user', JSON.stringify(result.data.user))
        }
      }
      
      return result
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed'
      return { success: false, message }
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user // Simple check - no OTP verification needed
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
export default AuthProvider
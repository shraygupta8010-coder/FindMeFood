import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import AuthProvider from './context/AuthContext'
import Home from './pages/Home'
import About from './pages/About' // ADD THIS IMPORT
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import NgoRegister from './pages/Auth/NgoRegister'
import Dashboard from './pages/Dashboard/Dashboard'
import NgoDashboard from './pages/Dashboard/NgoDashboard'
import CreateDonation from './pages/Donations/CreateDonation'
import MyDonations from './pages/Donations/MyDonations'
import NearbyNgos from './pages/Donations/NearbyNgos'
import RealNearbyNgos from './pages/Donations/RealNearbyNgos'
import Certifications from './pages/Certifications'
import Profile from './pages/profile/Profile'
import Contact from './pages/Contact/Contact'
import AdminAadhaarVerification from './components/AdminAadhaarVerification'

// Smooth Page Transition Component
const PageTransition = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [children])

  return (
    <div className={`page-container ${isVisible ? 'fade-in-up' : 'opacity-0'}`}>
      {children}
    </div>
  )
}

// Animated Background Component
const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      {/* Animated Gradient Background */}
      <div 
        className="animated-bg"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
                      linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #f5f7fa 100%)`
        }}
      />
      
      {/* Floating Food Icons */}
      <div className="floating-icons">
        <div className="floating-icon" style={{ '--delay': '0s', '--duration': '20s', left: '10%' }}>🍎</div>
        <div className="floating-icon" style={{ '--delay': '2s', '--duration': '25s', left: '20%' }}>🍞</div>
        <div className="floating-icon" style={{ '--delay': '4s', '--duration': '18s', left: '30%' }}>🥦</div>
        <div className="floating-icon" style={{ '--delay': '1s', '--duration': '22s', left: '40%' }}>🍲</div>
        <div className="floating-icon" style={{ '--delay': '3s', '--duration': '19s', left: '50%' }}>🥗</div>
        <div className="floating-icon" style={{ '--delay': '5s', '--duration': '21s', left: '60%' }}>🍇</div>
        <div className="floating-icon" style={{ '--delay': '2.5s', '--duration': '23s', left: '70%' }}>🥐</div>
        <div className="floating-icon" style={{ '--delay': '4.5s', '--duration': '17s', left: '80%' }}>🍊</div>
      </div>
    </>
  )
}

// Route with Animation Wrapper
const AnimatedRoute = ({ element }) => {
  const location = useLocation()
  
  return (
    <PageTransition key={location.key}>
      {element}
    </PageTransition>
  )
}

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="logo-animation">
            <div className="food-loader">
              <div className="apple animate__animated animate__bounce">🍎</div>
              <div className="bread animate__animated animate__bounce" style={{ animationDelay: '0.2s' }}>🍞</div>
              <div className="vegetables animate__animated animate__bounce" style={{ animationDelay: '0.4s' }}>🥦</div>
            </div>
          </div>
          <h1 className="gradient-text animate__animated animate__fadeInUp">FindMeFood</h1>
          <p className="animate__animated animate__fadeInUp" style={{ animationDelay: '0.3s' }}>
            Sharing food, spreading love ❤️
          </p>
          <div className="progress-bar" style={{ width: '200px', marginTop: '2rem' }}>
            <div className="progress-fill" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          {/* Animated Background */}
          <AnimatedBackground />
          
          {/* Main Content */}
          <div className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<AnimatedRoute element={<Home />} />} />
              <Route path="/about" element={<AnimatedRoute element={<About />} />} /> {/* ADD THIS ROUTE */}
              <Route path="/login" element={<AnimatedRoute element={<Login />} />} />
              <Route path="/register" element={<AnimatedRoute element={<Register />} />} />
              <Route path="/ngo/register" element={<AnimatedRoute element={<NgoRegister />} />} />
              <Route path="/nearby-ngos" element={<AnimatedRoute element={<NearbyNgos />} />} />
              <Route path="/real-nearby-ngos" element={<AnimatedRoute element={<RealNearbyNgos />} />} />
              <Route path="/certifications" element={<AnimatedRoute element={<Certifications />} />} />
              <Route path="/contact" element={<AnimatedRoute element={<Contact />} />} />
              
              {/* User Routes */}
              <Route path="/dashboard" element={<AnimatedRoute element={<Dashboard />} />} />
              <Route path="/create-donation" element={<AnimatedRoute element={<CreateDonation />} />} />
              <Route path="/my-donations" element={<AnimatedRoute element={<MyDonations />} />} />
              <Route path="/profile" element={<AnimatedRoute element={<Profile />} />} />
              
              {/* NGO Routes */}
              <Route path="/ngo-dashboard" element={<AnimatedRoute element={<NgoDashboard />} />} />
              
              {/* Admin Routes */}
              <Route path="/admin/aadhaar-verification" element={<AnimatedRoute element={<AdminAadhaarVerification />} />} />
            </Routes>
          </div>

          {/* Global Notification Container */}
          <div id="notification-container"></div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
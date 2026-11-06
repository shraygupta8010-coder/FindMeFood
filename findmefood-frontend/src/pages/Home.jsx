import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  // Impact counters state
  const [counters, setCounters] = useState({
    meals: 0,
    donations: 0,
    ngos: 0,
    cities: 0
  });

  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const storiesRef = useRef(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Animate counters on component mount
  useEffect(() => {
    setIsVisible(true);

    const targetCounters = {
      meals: 12450,
      donations: 847,
      ngos: 23,
      cities: 8
    };

    Object.keys(targetCounters).forEach(key => {
      let current = 0;
      const target = targetCounters[key];
      const increment = target / 50;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, 40);
    });
  }, []);

  // Floating food icons data
  const floatingIcons = ['🍎', '🍞', '🥦', '🍲', '🥗', '🍇', '🥐', '🍊', '🥕', '🍌'];

  return (
    <div className="findmefood-app">
      {/* Floating Background Icons */}
      <div className="floating-background-icons">
        {floatingIcons.map((icon, index) => (
          <div 
            key={index}
            className="floating-food-icon"
            style={{
              '--delay': `${index * 2}s`,
              '--duration': `${15 + index * 2}s`,
              left: `${(index * 10) % 90}%`,
              animationDelay: `var(--delay)`,
              animationDuration: `var(--duration)`
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="site-header glass-nav">
        <div className="brand" onClick={() => window.location.href = '/'}>
          <div className="logo-icon pulse">🍽️❤️</div>
          <div className="brand-text">
            <div className="name gradient-text">FindMeFood</div>
            <div className="tagline">Share food • Feed communities</div>
          </div>
        </div>

        <nav className="topnav">
          <Link to="/" className="nav-link hover-card">🏠 Home</Link>
          <Link to="/about" className="nav-link hover-card">ℹ️ About</Link>
          <Link to="/certifications" className="nav-link hover-card">🏆 Certifications</Link>
          <Link to="/contact" className="nav-link hover-card">📞 Contact</Link>
          <Link to="/login" className="btn btn-primary pulse">💝 Donate</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className={`hero-card glass-card ${isVisible ? 'bounce-in' : ''}`}>
          <div className="logo-box float">🍽️❤️</div>
          <h1 className="typewriter">FindMeFood</h1>
          <p className="hero-subtitle fade-in-up">
            Welcome to FindMeFood — Share food, spread love, and make a difference!
          </p>

          {/* Impact Counters - VISUALLY ENHANCED */}
          <div className="impact-counters animate-on-scroll">
            <div className="counter-item hover-card">
              <div className="counter-visual">
                <div className="counter-icon meal-icon">🍽️</div>
                <div className="floating-plate">🍛</div>
                <div className="floating-utensil">🥄</div>
              </div>
              <div className="counter-number">
                {counters.meals.toLocaleString()}+
              </div>
              <div className="counter-label">Meals Donated</div>
              <div className="counter-sparkle">✨</div>
              <div className="counter-ribbon">Hot Meals</div>
            </div>
            
            <div className="counter-item hover-card">
              <div className="counter-visual">
                <div className="counter-icon heart-icon">❤️</div>
                <div className="floating-hearts">
                  <span className="heart-1">💝</span>
                  <span className="heart-2">💖</span>
                </div>
              </div>
              <div className="counter-number">{counters.donations}+</div>
              <div className="counter-label">Successful Donations</div>
              <div className="counter-sparkle">🌟</div>
              <div className="counter-ribbon">Active</div>
            </div>
            
            <div className="counter-item hover-card">
              <div className="counter-visual">
                <div className="counter-icon building-icon">🏢</div>
                <div className="floating-hands">🤝</div>
                <div className="floating-star">⭐</div>
              </div>
              <div className="counter-number">{counters.ngos}+</div>
              <div className="counter-label">Partner NGOs</div>
              <div className="counter-sparkle">🎯</div>
              <div className="counter-ribbon">Verified</div>
            </div>
            
            <div className="counter-item hover-card">
              <div className="counter-visual">
                <div className="counter-icon location-icon">📍</div>
                <div className="floating-pin">📌</div>
                <div className="floating-globe">🌍</div>
              </div>
              <div className="counter-number">{counters.cities}+</div>
              <div className="counter-label">Cities Covered</div>
              <div className="counter-sparkle">🚀</div>
              <div className="counter-ribbon">Growing</div>
            </div>
          </div>

          {/* Notification Box */}
          <div className="notify-box glass-card animate-on-scroll">
            <div className="bell pulse">🔔</div>
            <div className="notify-content">
              <div className="notify-title">Enable Browser Notifications</div>
              <div className="notify-desc">Get alerts about donation pickups and NGO requests to stay involved in real-time.</div>
            </div>
          </div>

          {/* Hero Actions */}
          <div className="hero-actions animate-on-scroll">
            <button className="btn btn-ghost hover-card">
              🔔 Enable Notifications
            </button>
            <Link to="/login" className="btn btn-primary btn-large pulse">
              Start Donating ➜
            </Link>
          </div>

          {/* Hero Footer */}
          <div className="hero-footer fade-in-up">
            Together, we can end hunger.<br />Let's make every meal count. 🌍❤️
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content">
        {/* Mission Section */}
        <div className="content-card glass-card animate-on-scroll">
          <div className="content-grid">
            <div className="content-text">
              <h2>Together, we can <span className="gradient-text">end hunger</span></h2>
              <p>Share your surplus food today and help us create a world where no one goes to bed hungry.</p>
              <Link to="/login" className="btn btn-primary pulse">💝 Donate Now</Link>
              
              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="stat">
                  <span className="stat-number">🚚 2hr</span>
                  <span className="stat-label">Avg. Pickup Time</span>
                </div>
                <div className="stat">
                  <span className="stat-number">✅ 98%</span>
                  <span className="stat-label">Success Rate</span>
                </div>
                <div className="stat">
                  <span className="stat-number">🌱 5.2T</span>
                  <span className="stat-label">CO₂ Saved</span>
                </div>
              </div>
            </div>
            <div className="content-visual">
              <div className="food-illustration float">🍲</div>
              <div className="floating-dots">
                <div className="dot dot-1"></div>
                <div className="dot dot-2"></div>
                <div className="dot dot-3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-section animate-on-scroll">
          <h2>How It Works</h2>
          <p className="section-subtitle">Simple steps to make a big impact</p>
          
          <div className="features-grid">
            <div className="feature-card hover-card">
              <div className="feature-icon pulse">♥</div>
              <div className="feature-number">01</div>
              <h3>Donate Food</h3>
              <p>Share your excess food by creating a donation with details and photos</p>
              <div className="feature-arrow">➜</div>
            </div>
            <div className="feature-card hover-card">
              <div className="feature-icon pulse">👥</div>
              <div className="feature-number">02</div>
              <h3>NGOs Respond</h3>
              <p>Local NGOs receive notifications and can accept your donation</p>
              <div className="feature-arrow">➜</div>
            </div>
            <div className="feature-card hover-card">
              <div className="feature-icon pulse">🚚</div>
              <div className="feature-number">03</div>
              <h3>Food Delivered</h3>
              <p>NGOs arrange pickup and distribute food to those in need</p>
              <div className="feature-arrow">✅</div>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="success-stories animate-on-scroll" ref={storiesRef}>
          <h2>🌟 Success Stories</h2>
          <p className="stories-subtitle">Real impact from our amazing community</p>
          
          <div className="stories-grid">
            <div className="story-card hover-card">
              <div className="story-image pulse">🍛</div>
              <div className="story-content">
                <h3>From Restaurant to 200 Meals</h3>
                <p>"We donated surplus food from our restaurant and it reached a local shelter within 2 hours! The process was incredibly smooth."</p>
                <div className="story-meta">
                  <span>🍽️ 200 meals provided</span>
                  <span>📍 Delhi</span>
                </div>
                <div className="story-author">- Rajesh, Restaurant Owner</div>
              </div>
              <div className="story-badge">🔥 Hot Meal</div>
            </div>
            
            <div className="story-card hover-card">
              <div className="story-image pulse">💒</div>
              <div className="story-content">
                <h3>Wedding Feast Feeds Community</h3>
                <p>"Our wedding had extra food that would have gone to waste. FindMeFood connected us with 3 NGOs who collected everything!"</p>
                <div className="story-meta">
                  <span>🍽️ 150+ meals donated</span>
                  <span>📍 Mumbai</span>
                </div>
                <div className="story-author">- Priya & Amit, Newlyweds</div>
              </div>
              <div className="story-badge">🎉 Special Event</div>
            </div>
            
            <div className="story-card hover-card">
              <div className="story-image pulse">🏢</div>
              <div className="story-content">
                <h3>Corporate Kitchen Partnership</h3>
                <p>"Our office cafeteria now donates daily surplus through FindMeFood. It's become part of our sustainability initiative!"</p>
                <div className="story-meta">
                  <span>🍽️ 50+ daily meals</span>
                  <span>📍 Bangalore</span>
                </div>
                <div className="story-author">- TechCorp India</div>
              </div>
              <div className="story-badge">🏢 Corporate</div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="trust-indicators animate-on-scroll">
          <h2>✅ Trusted & Verified</h2>
          <p className="section-subtitle">Your safety and trust are our priority</p>
          
          <div className="trust-grid">
            <div className="trust-item hover-card">
              <div className="trust-icon pulse">🔒</div>
              <h3>Secure & Safe</h3>
              <p>All NGOs are verified and food safety standards are maintained</p>
            </div>
            <div className="trust-item hover-card">
              <div className="trust-icon pulse">📱</div>
              <h3>Real-time Tracking</h3>
              <p>Track your donation from pickup to delivery with live updates</p>
            </div>
            <div className="trust-item hover-card">
              <div className="trust-icon pulse">🏛️</div>
              <h3>Legal Compliance</h3>
              <p>FSSAI licensed and 12A/80G registered for tax benefits</p>
            </div>
            <div className="trust-item hover-card">
              <div className="trust-icon pulse">🌍</div>
              <h3>Environmental Impact</h3>
              <p>Reduce food waste and help combat climate change</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section glass-card animate-on-scroll">
          <div className="cta-content">
            <h2>Ready to Make a Difference?</h2>
            <p>Join thousands of donors and NGOs fighting hunger together</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-large pulse">
                🎉 Start Donating
              </Link>
              <Link to="/ngo/register" className="btn btn-accent btn-large">
                🏢 Register NGO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer glass-card">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo-icon">🍽️❤️</div>
            <div className="brand-text">
              <div className="name gradient-text">FindMeFood</div>
              <div className="tagline">Share food • Feed communities</div>
            </div>
          </div>

          <div className="social-links">
            <a href="#" className="social-link hover-card">📘</a>
            <a href="#" className="social-link hover-card">🐦</a>
            <a href="#" className="social-link hover-card">📷</a>
            <a href="#" className="social-link hover-card">💬</a>
            <a href="#" className="social-link hover-card">💼</a>
          </div>

          {/* Live Stats Footer */}
          <div className="live-stats">
            <div className="stat-item pulse">
              <span className="stat-number">{counters.donations}+</span>
              <span className="stat-label">Donations Today</span>
            </div>
            <div className="stat-item pulse">
              <span className="stat-number">{counters.meals.toLocaleString()}+</span>
              <span className="stat-label">Meals Served</span>
            </div>
            <div className="stat-item pulse">
              <span className="stat-number">{counters.ngos}+</span>
              <span className="stat-label">Active NGOs</span>
            </div>
          </div>

          <div className="footer-info">
            <div>© 2024 FindMeFood — Share food, spread love 🌍❤️</div>
            <div className="footer-links">
              <span>support@findmefood.org</span>
              <span>FSSAI Licensed</span>
              <span>12A & 80G Registered</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
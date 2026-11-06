import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      image: "👨‍💼",
      description: "Passionate about solving food waste and hunger issues through technology.",
      social: "linkedin.com/in/rajesh"
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "Head of NGO Partnerships",
      image: "👩‍💼",
      description: "Connecting NGOs with donors to maximize community impact.",
      social: "linkedin.com/in/priya"
    },
    {
      id: 3,
      name: "Amit Patel",
      role: "Tech Lead",
      image: "👨‍💻",
      description: "Building scalable solutions to make food donation seamless.",
      social: "linkedin.com/in/amit"
    },
    {
      id: 4,
      name: "Neha Gupta",
      role: "Community Manager",
      image: "👩‍🤝‍👩",
      description: "Engaging with donors and recipients to improve user experience.",
      social: "linkedin.com/in/neha"
    }
  ];

  const milestones = [
    { year: "2023", event: "FindMeFood Founded", description: "Started with a mission to reduce food waste" },
    { year: "2024", event: "1000+ Donations", description: "Reached milestone of 1000 successful food donations" },
    { year: "2024", event: "25+ Partner NGOs", description: "Expanded network to 25 verified NGOs across India" },
    { year: "2024", event: "10,000+ Meals", description: "Provided over 10,000 meals to those in need" }
  ];

  const values = [
    {
      icon: "🤝",
      title: "Community First",
      description: "We believe in building strong communities where everyone has access to nutritious food."
    },
    {
      icon: "🌱",
      title: "Sustainability",
      description: "Reducing food waste while feeding communities - a win-win for people and planet."
    },
    {
      icon: "🔒",
      title: "Trust & Safety",
      description: "All NGOs are verified and food safety standards are strictly maintained."
    },
    {
      icon: "🚀",
      title: "Innovation",
      description: "Using technology to make food donation simple, fast, and effective."
    }
  ];

  return (
    <div className="about-page">
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
          <Link to="/about" className="nav-link hover-card active">ℹ️ About</Link>
          <Link to="/certifications" className="nav-link hover-card">🏆 Certifications</Link>
          <Link to="/contact" className="nav-link hover-card">📞 Contact</Link>
          <Link to="/login" className="btn btn-primary pulse">💝 Donate</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content glass-card">
          <h1 className="typewriter">Our Story</h1>
          <p className="hero-subtitle">
            Connecting surplus food with hungry hearts through technology and compassion
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Meals Served</div>
            </div>
            <div className="stat">
              <div className="stat-number">25+</div>
              <div className="stat-label">Partner NGOs</div>
            </div>
            <div className="stat">
              <div className="stat-number">8</div>
              <div className="stat-label">Cities</div>
            </div>
            <div className="stat">
              <div className="stat-number">98%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-content animate-on-scroll">
              <h2>Our Mission</h2>
              <p className="mission-text">
                At FindMeFood, we're on a mission to eliminate food waste and hunger by creating a seamless 
                connection between food donors and verified NGOs. We believe that no edible food should go 
                to waste while people go hungry.
              </p>
              <p className="mission-text">
                Through our innovative platform, we're building a community of conscious donors, 
                dedicated NGOs, and volunteers working together to create a hunger-free world.
              </p>
              <div className="mission-actions">
                <Link to="/register" className="btn btn-primary">Join Our Mission</Link>
                <Link to="/contact" className="btn btn-ghost">Learn More</Link>
              </div>
            </div>
            <div className="mission-visual animate-on-scroll">
              <div className="visual-container">
                <div className="floating-food">🍎</div>
                <div className="floating-food">🍞</div>
                <div className="floating-food">🥦</div>
                <div className="main-illustration">🤝</div>
                <div className="connection-line"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <p className="section-subtitle">The principles that guide everything we do</p>
          
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card hover-card animate-on-scroll">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="container">
          <h2 className="section-title">Our Journey</h2>
          <p className="section-subtitle">Milestones in our mission to fight hunger</p>
          
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'} animate-on-scroll`}>
                <div className="timeline-content hover-card">
                  <div className="timeline-year">{milestone.year}</div>
                  <h3>{milestone.event}</h3>
                  <p>{milestone.description}</p>
                </div>
                <div className="timeline-marker"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-title">Meet Our Team</h2>
          <p className="section-subtitle">The passionate people behind FindMeFood</p>
          
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-card hover-card animate-on-scroll">
                <div className="member-image">{member.image}</div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <div className="member-role">{member.role}</div>
                  <p>{member.description}</p>
                  <div className="member-social">{member.social}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content glass-card">
            <h2>Ready to Make a Difference?</h2>
            <p>Join thousands of donors and NGOs fighting hunger together</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-large">Start Donating</Link>
              <Link to="/ngo/register" className="btn btn-accent btn-large">Register NGO</Link>
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

          <div className="footer-info">
            <div>© 2024 FindMeFood — Making every meal count 🌍❤️</div>
            <div className="footer-links">
              <span>support@findmefood.org</span>
              <span>FSSAI Licensed</span>
              <span>12A & 80G Registered</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
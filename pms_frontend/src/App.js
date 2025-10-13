import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import OwnerDashboard from './pages/owner/OwnerDashboard.jsx';
import TenantDashboard from './pages/tenant/TenantDashboard.jsx';
import './styles/index.css';

const Home = () => {
  return (
    <div className="homepage">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="premium-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title display-title">
                Find Your Dream 
                <span className="text-gradient"> Home Today</span>
              </h1>
              <p className="hero-subtitle">
                Discover thousands of verified rental properties or list your own. 
                Join our community of satisfied homeowners and tenants.
              </p>
              <div className="hero-buttons">
                <Link to="/signup" className="btn-premium btn-primary">
                  Explore Properties
                </Link>
                <Link to="/signup?role=owner" className="btn-premium btn-secondary">
                  List Your Property
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">10K+</div>
                  <div className="stat-label">Properties</div>
                </div>
                <div className="stat">
                  <div className="stat-number">50K+</div>
                  <div className="stat-label">Happy Users</div>
                </div>
                <div className="stat">
                  <div className="stat-number">100+</div>
                  <div className="stat-label">Cities</div>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="property-showcase">
                <div className="property-card showcase-card">
                  <div className="property-badge">Featured</div>
                  <img 
                    src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" 
                    alt="Luxury Apartment"
                    className="showcase-image"
                  />
                  <div className="showcase-content">
                    <div className="property-price">$2,500/mo</div>
                    <div className="property-title">Luxury 3BHK Apartment</div>
                    <div className="property-location">Miami, Florida</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="premium-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose RentEase</h2>
            <p className="section-subtitle">Experience the best in property rental with our premium features</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Verified</h3>
              <p>All properties and users are thoroughly verified for your safety and peace of mind.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Booking</h3>
              <p>Book your dream property instantly with our streamlined rental process.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Get the best deals with no hidden charges or brokerage fees.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Premium Support</h3>
              <p>24/7 customer support to help you with all your rental needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="premium-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get started in just a few simple steps</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">01</div>
              <div className="step-icon">📝</div>
              <h3>Create Account</h3>
              <p>Sign up as a tenant or property owner in minutes</p>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <div className="step-icon">🔍</div>
              <h3>Find or List</h3>
              <p>Browse properties or list your own with detailed information</p>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <div className="step-icon">🤝</div>
              <h3>Connect</h3>
              <p>Connect with potential tenants or property owners</p>
            </div>
            <div className="step">
              <div className="step-number">04</div>
              <div className="step-icon">🏠</div>
              <h3>Move In</h3>
              <p>Complete the agreement and move into your new home</p>
            </div>
          </div>
        </div>
      </section>

      {/* Property Showcase */}
      <section className="property-showcase-section">
        <div className="premium-container">
          <div className="section-header">
            <h2 className="section-title">Featured Properties</h2>
            <p className="section-subtitle">Discover our most popular rental properties</p>
          </div>
          <div className="properties-grid">
            <div className="property-card-premium">
              <div className="property-image-container">
                <img 
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" 
                  alt="Modern Apartment"
                  className="property-image"
                />
                <div className="property-badge">New</div>
              </div>
              <div className="property-content">
                <div className="property-price">$1,800<span>/month</span></div>
                <h3 className="property-title">Modern Studio Apartment</h3>
                <div className="property-address">📍 New York, NY</div>
                <div className="property-features">
                  <div className="feature">
                    <div className="feature-value">1</div>
                    <div className="feature-label">Bed</div>
                  </div>
                  <div className="feature">
                    <div className="feature-value">1</div>
                    <div className="feature-label">Bath</div>
                  </div>
                  <div className="feature">
                    <div className="feature-value">650</div>
                    <div className="feature-label">Sq Ft</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="property-card-premium">
              <div className="property-image-container">
                <img 
                  src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" 
                  alt="Luxury Villa"
                  className="property-image"
                />
                <div className="property-badge featured">Featured</div>
              </div>
              <div className="property-content">
                <div className="property-price">$4,200<span>/month</span></div>
                <h3 className="property-title">Luxury Beach Villa</h3>
                <div className="property-address">📍 Miami, Florida</div>
                <div className="property-features">
                  <div className="feature">
                    <div className="feature-value">4</div>
                    <div className="feature-label">Beds</div>
                  </div>
                  <div className="feature">
                    <div className="feature-value">3</div>
                    <div className="feature-label">Baths</div>
                  </div>
                  <div className="feature">
                    <div className="feature-value">2,800</div>
                    <div className="feature-label">Sq Ft</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="property-card-premium">
              <div className="property-image-container">
                <img 
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" 
                  alt="City Condo"
                  className="property-image"
                />
                <div className="property-badge">Popular</div>
              </div>
              <div className="property-content">
                <div className="property-price">$2,100<span>/month</span></div>
                <h3 className="property-title">Downtown Condo</h3>
                <div className="property-address">📍 Chicago, IL</div>
                <div className="property-features">
                  <div className="feature">
                    <div className="feature-value">2</div>
                    <div className="feature-label">Beds</div>
                  </div>
                  <div className="feature">
                    <div className="feature-value">2</div>
                    <div className="feature-label">Baths</div>
                  </div>
                  <div className="feature">
                    <div className="feature-value">1,200</div>
                    <div className="feature-label">Sq Ft</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section-cta">
            <Link to="/signup" className="btn-premium btn-primary">
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="premium-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Find Your Perfect Home?</h2>
            <p className="cta-subtitle">
              Join thousands of satisfied users who found their dream rental through RentEase
            </p>
            <div className="cta-buttons">
              <Link to="/signup" className="btn-premium btn-primary btn-large">
                Get Started Now
              </Link>
              <Link to="/login" className="btn-premium btn-secondary btn-large">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/tenant/dashboard" element={<TenantDashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
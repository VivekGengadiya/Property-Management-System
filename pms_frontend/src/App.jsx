import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import Navbar from './components/common/Navbar.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import OwnerDashboard from './pages/owner/OwnerDashboard.jsx';
import TenantDashboard from './pages/tenant/TenantDashboard.jsx';
// import Dashboard from './pages/Dashboard.jsx';
import './styles/index.css';
import MaintenanceDashboard from './pages/maintenance/MaintenanceDashboard.jsx';
import StaffTickets from './pages/maintenance/StaffTickets.jsx';
import StaffTicketDetail from './pages/maintenance/StaffTicketDetail.jsx';
import PropertyDetail from './pages/tenant/PropertyDetail.jsx';
import UnitDetail from './pages/tenant/UnitDetail.jsx';
import ApplicationForm from './pages/tenant/ApplicationForm.jsx';
import Applications from './pages/tenant/Applications.jsx';
import TenantLeasePreview from './pages/tenant/LeasePreview.jsx';
import MyLeases from './pages/tenant/MyLeases.jsx';
import Payment from './pages/tenant/Payment.jsx';
import PaymentHistory from './pages/tenant/PaymentHistory.jsx';
import LeasedProperties from './pages/tenant/LeasedProperties.jsx';
import CreateMaintenanceTicket from './pages/tenant/CreateMaintenanceTicket.jsx';
import MaintenanceTickets from './pages/tenant/MaintenanceTickets.jsx';
// Protected Route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-spinner" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-spinner" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" />;
};

// Role-based dashboard redirector
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case 'LANDLORD':
      return <Navigate to="/owner/dashboard" />;
    case 'TENANT':
      return <Navigate to="/tenant/dashboard" />;
    case 'MAINTENANCE':
      return <Navigate to="/maintenance/dashboard" />;
    default:
      return <Navigate to="/dashboard" />;
  }
};

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="homepage">
      <Navbar />
      
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
                {!user ? (
                  <>
                    <Link to="/signup" className="btn-premium btn-primary">
                      Explore Properties
                    </Link>
                    <Link to="/signup?role=owner" className="btn-premium btn-secondary">
                      List Your Property
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" className="btn-premium btn-primary">
                      Go to Dashboard
                    </Link>
                    {user.role === 'LANDLORD' && (
                      <Link to="/owner/dashboard" className="btn-premium btn-secondary">
                        Manage Properties
                      </Link>
                    )}
                  </>
                )}
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
                    src="../src/images/todd-kent-178j8tJrNlc-unsplash.jpg" 
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
                  src="https://images.unsplash.com/photo-1515263487990-61b07816b324?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2940" 
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
                  src="https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2940" 
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
            {!user ? (
              <Link to="/signup" className="btn-premium btn-primary">
                View All Properties
              </Link>
            ) : (
              <Link to="/dashboard" className="btn-premium btn-primary">
                Browse Properties
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="premium-container">
          <div className="cta-content">
            <h2 className="cta-title">
              {!user ? 'Ready to Find Your Perfect Home?' : `Welcome back, ${user.name}!`}
            </h2>
            <p className="cta-subtitle">
              {!user 
                ? 'Join thousands of satisfied users who found their dream rental through RentEase'
                : 'Continue managing your properties and rental experience'
              }
            </p>
            <div className="cta-buttons">
              {!user ? (
                <>
                  <Link to="/signup" className="btn-premium btn-primary btn-large">
                    Get Started Now
                  </Link>
                  <Link to="/login" className="btn-premium btn-secondary btn-large">
                    Sign In
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="btn-premium btn-primary btn-large">
                    Go to Dashboard
                  </Link>
                  <Link to="/profile" className="btn-premium btn-secondary btn-large">
                    My Profile
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const SimpleDashboard = () => {
  const { user, logout, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      const dashboardPath = getRoleDashboardPath(user.role);
      navigate(dashboardPath);
    }
  }, [user, navigate, getRoleDashboardPath]);

  return (
    <div className="dashboard-container">
      <Header />
      <div className="premium-container" style={{ padding: '2rem 0' }}>
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <p>Redirecting you to your {user?.role} dashboard...</p>
          <div className="loading-spinner" style={{ margin: '20px 0' }}>
            Loading your dashboard...
          </div>
          <button onClick={logout} className="btn-premium btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />
            
            {/* <Route path="/dashboard" element={
              <ProtectedRoute>
                <SimpleDashboard />
              </ProtectedRoute>
            } /> */}
            
            <Route path="/owner/dashboard" element={
              <ProtectedRoute requiredRole="LANDLORD">
                <OwnerDashboard />
              </ProtectedRoute>
            } />
            
            {/* Tenant Routes */}
            <Route path="/tenant/dashboard" element={
              <ProtectedRoute requiredRole="TENANT">
                <TenantDashboard />
              </ProtectedRoute>
            } />
            
            
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/unit/:id" element={<UnitDetail />} />
            <Route path="/apply" element={<ApplicationForm />} />
            <Route path="/tenant/my-applications" element={<Applications />} />
            
<Route path="/lease/preview/:leaseId?" element={<TenantLeasePreview />} />
            <Route path="/lease/preview" element={<TenantLeasePreview />} />
            <Route path="/tenant/leases" element={<MyLeases />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/history" element={<PaymentHistory />} />
            <Route path="/tenant/leased-properties" element={<LeasedProperties />} />
            <Route path="/maintenance/create" element={<CreateMaintenanceTicket />} />
            <Route path="/tenant/maintenance-tickets" element={<MaintenanceTickets />} />


<Route path="/maintenance/dashboard" element={
              <ProtectedRoute requiredRole="MAINTENANCE">
                <MaintenanceDashboard />
              </ProtectedRoute>
            } />

           <Route path="/staff/tickets" element={<StaffTickets />} />
<Route path="/staff/ticket/:id" element={<StaffTicketDetail />} />
            
            <Route path="/my-dashboard" element={<DashboardRedirect />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
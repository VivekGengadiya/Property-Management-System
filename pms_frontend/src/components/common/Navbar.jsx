import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'LANDLORD': return '/owner/dashboard';
      case 'TENANT': return '/tenant/dashboard';
      case 'MAINTENANCE': return '/maintenance/dashboard';
      default: return '/';
    }
  };

  const roleLinks = {
    LANDLORD: [
      { to: '/', label: 'Home' },
      { to: '/owner/dashboard', label: 'Properties' },
      { to: '/about', label: 'About' },
      { to: '/media', label: 'Media' },
      { to: '/contact', label: 'Contact Us' },
    ],
    TENANT: [
      { to: '/', label: 'Home' },
      { to: '/tenant/dashboard', label: 'Properties' },
      { to: '/tenant/my-applications', label: 'My Applications' },
      { to: '/tenant/leased-properties', label:'Leased Properties'},
      { to: '/tenant/maintenance-tickets', label:'Maintenance ticket'},
      { to: '/payment/history', label:'Payment History'},
      { to: '/about', label: 'About' },
      { to: '/media', label: 'Media' },
      { to: '/contact', label: 'Contact Us' },
      { to: '/profile', label: 'Profile' },
    ],
    MAINTENANCE: [
      { to: '/', label: 'Home' },
      { to: '/maintenance/dashboard', label: 'Dashboard' },
      { to: '/maintenance/tasks', label: 'Tasks' },
      { to: '/maintenance/history', label: 'History' },
      { to: '/about', label: 'About' },
      { to: '/media', label: 'Media' },
      { to: '/contact', label: 'Contact Us' },
    ],
  };

  if (loading) return (
    <header className="common-navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo">Vasudha</Link>
          <span className="nav-loading">Loading...</span>
        </div>
      </div>
    </header>
  );

  return (
    <header className="common-navbar">
      <div className="navbar-container">

        <div className="navbar-content">

          {/* Logo */}
          <Link to="/" className="navbar-logo">Vasudha</Link>

          {/* Hamburger Icon (Mobile Only) */}
          <button
            className={`hamburger ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)} value='hamburger'
             aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Navigation Links */}
          <nav className={`navbar-links ${isOpen ? 'open' : ''}`}>
            {user && (roleLinks[user.role] || []).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="nav-item"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className={`navbar-auth ${isOpen ? 'open' : ''}`}>
            {user ? (
              <div className="nav-user">
                <span className="welcome-text">
                  Welcome, <strong>{user.name}</strong>
                </span>
                <button onClick={() => { setIsOpen(false); handleLogout(); }} className="btn-logout">
                  Logout
                </button>
              </div>
            ) : (
              <div className="nav-guest">
                <Link to="/login" className="btn-login" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="btn-signup" onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;

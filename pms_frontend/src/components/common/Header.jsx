import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Header = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'LANDLORD':
        return '/owner/dashboard';
      case 'TENANT':
        return '/tenant/dashboard';
      case 'MAINTENANCE':
        return '/maintenance/dashboard';
      default:
        return '/';
    }
  };

  if (loading) {
    return (
      <header className="premium-header">
        <div className="premium-container">
          <div className="header-content">
            <Link to="/" className="luxury-logo">
              <span className="logo-text">Vasudha</span>
            </Link>
            <nav className="premium-nav">
              <span className="nav-text">Loading...</span>
            </nav>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="premium-header">
      <div className="premium-container">
        <div className="header-content">
          <Link to="/" className="luxury-logo">
            <span className="logo-text">Vasudha</span>
          </Link>

          <nav className="premium-nav">
            {user ? (
              <div className="user-nav-section">
                <span className="nav-welcome">
                  Welcome, <strong>{user.name}</strong>!
                </span>
                <button 
                  onClick={handleLogout} 
                  className="btn-premium btn-outline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/signup">
                  <button className="btn-premium btn-primary" style={{padding: '0.5rem 1.5rem'}}>
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
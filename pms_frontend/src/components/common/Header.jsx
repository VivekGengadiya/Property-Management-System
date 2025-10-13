import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  // Remove useAuth and use simple state for demo
  const user = null; // For demo - no user logged in

  return (
    <header className="premium-header">
      <div className="premium-container">
        <div className="header-content">
          <Link to="/" className="luxury-logo">
            {/* <div className="logo-icon">RE</div> */}
            <span className="logo-text">Vasudha</span>
          </Link>

          <nav className="premium-nav">
            {user ? (
              <>
                <span className="nav-text">Welcome, User!</span>
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <button className="btn-premium btn-outline">
                  Logout
                </button>
              </>
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
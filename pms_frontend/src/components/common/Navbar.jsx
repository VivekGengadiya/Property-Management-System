import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "LANDLORD":
        return "/owner/dashboard";
      case "TENANT":
        return "/tenant/dashboard";
      case "MAINTENANCE":
        return "/maintenance/dashboard";
      default:
        return "/";
    }
  };

  const roleLinks = {
    LANDLORD: [
      { to: "/", label: "Home" },
      { to: "/owner/dashboard", label: "My Properties" },
      { to: "/about", label: "About" },
      { to: "/media", label: "Media" },
      { to: "/contact", label: "Contact Us" },
    ],

    TENANT: [
      { to: "/", label: "Home" },
      { to: "/tenant/dashboard", label: "Properties" },
      { to: "/tenant/my-applications", label: "My Applications" },
      { to: "/tenant/leased-properties", label: "Leased Properties" },

      {
        label: "More",
        dropdown: [
          { to: "/payment/history", label: "Payment History" },
          { to: "/tenant/maintenance-tickets", label: "Maintenance ticket" },
          { to: "/about", label: "About" },
          { to: "/media", label: "Media" },
          { to: "/contact", label: "Contact" },
        ],
      },
    ],

    MAINTENANCE: [
      { to: "/", label: "Home" },
      { to: "/maintenance/dashboard", label: "My Task" },
      { to: "/about", label: "About" },
      { to: "/media", label: "Media" },
      { to: "/contact", label: "Contact Us" },
    ],
  };

  if (loading)
    return (
      <header className="common-navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <Link to="/" className="navbar-logo">
              Vasudha
            </Link>
            <span className="nav-loading">Loading...</span>
          </div>
        </div>
      </header>
    );

  return (
    <header className="common-navbar">
      <div className="navbar-container">
        <div className="navbar-content">
<Link to="/" className="navbar-logo logo-with-icon">
  <img
    src="../src/assets/NavLogo.png"     
    alt="Vasudha Logo"
    className="nav-logo-img"
  />
  <span>Vasudha</span>
</Link>
         

          {/* Hamburger Icon */}
          <button
            className={`hamburger ${isOpen ? "active" : ""}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? "✖️" : "☰"}
          </button>

          {/* Navigation Links */}
          <nav className={`navbar-links ${isOpen ? "open" : ""}`}>
            {user &&
              (roleLinks[user.role] || []).map((link, index) => {
                if (link.dropdown) {
                  return (
                    <div
                      key={index}
                      className="nav-dropdown"
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <span className="nav-item dropdown-toggle">
                        {link.label} ▾
                      </span>

                      {/* Dropdown Menu */}
                      <div
                        className={`dropdown-menu ${
                          dropdownOpen ? "show" : ""
                        }`}
                      >
                        {link.dropdown.map((item, i) => (
                          <Link
                            key={i}
                            to={item.to}
                            className="dropdown-item"
                            onClick={() => setIsOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Normal links
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="nav-item"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
          </nav>

          {/* Auth Buttons */}
          <div className={`navbar-auth ${isOpen ? "open" : ""}`}>
            {user ? (
              <div className="nav-user">
                <span className="welcome-text">
                  Welcome, <strong>{user.name}</strong>
                </span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="btn-logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="nav-guest">
                <Link
                  to="/login"
                  className="btn-login"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-signup"
                  onClick={() => setIsOpen(false)}
                >
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

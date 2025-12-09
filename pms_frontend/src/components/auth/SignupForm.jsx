import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useError } from "../../context/ErrorContext";
import Navbar from '../common/Navbar';

const SignupForm = () => {
  const { showError } = useError();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'TENANT',
  });

  const [errors, setErrors] = useState({});
  const { signup, loading, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    // Name: only letters and spaces
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name should contain only letters';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid phone number';
    }

    // Password
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm Password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      const result = await signup(submitData);

      const dashboardPath = getRoleDashboardPath(result.user.role);
      navigate(dashboardPath);
    } catch (error) {
      showError(error.message);
      setErrors({ general: error.message || 'Something went wrong during signup' });
    }
    return;
  };

  // Combine all error messages at the top
  const allErrorMessages = Object.values(errors);

  return (
<div>
  <Navbar />
    <div className="auth-page-premium" style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: '0'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: '0'
      }}></div>
      
      <div className="auth-container-premium" style={{
        background: 'var(--bg-card)',
        padding: '3rem',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-glow)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        width: '100%',
        maxWidth: '50rem',
        position: 'relative',
        zIndex: '1',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="auth-header" style={{
          textAlign: 'center',
          marginBottom: '2.5rem'
        }}>
          <h1 className="auth-title" style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            background: 'var(--gradient-hero)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Create Account</h1>
          <p className="auth-subtitle" style={{
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            lineHeight: '1.6'
          }}>Join our property rental platform</p>
        </div>

        {allErrorMessages.length > 0 && (
          <div className="error-message" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--text-primary)',
            padding: '1.5rem',
            borderRadius: '16px',
            marginBottom: '2rem'
          }}>
            <ul style={{
              margin: 0,
              paddingLeft: '1.5rem',
              color: 'var(--text-primary)'
            }}>
              {allErrorMessages.map((err, index) => (
                <li key={index} style={{marginBottom: '0.5rem'}}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group-premium" style={{marginBottom: '1.5rem'}}>
            <label className="form-label-premium" style={{
              display: 'block',
              color: 'var(--text-primary)',
              fontWeight: '600',
              marginBottom: '0.75rem',
              fontSize: '1.25rem'
            }}>Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="form-input-premium"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: 'var(--bg-primary)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-light)';
                e.target.style.boxShadow = 'var(--shadow-sm)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Email */}
          <div className="form-group-premium" style={{marginBottom: '1.5rem'}}>
            <label className="form-label-premium" style={{
              display: 'block',
              color: 'var(--text-primary)',
              fontWeight: '600',
              marginBottom: '0.75rem',
              fontSize: '1.25rem'
            }}>Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="form-input-premium"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: 'var(--bg-primary)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-light)';
                e.target.style.boxShadow = 'var(--shadow-sm)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Phone */}
          <div className="form-group-premium" style={{marginBottom: '1.5rem'}}>
            <label className="form-label-premium" style={{
              display: 'block',
              color: 'var(--text-primary)',
              fontWeight: '600',
              marginBottom: '0.75rem',
              fontSize: '1.25rem'
            }}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              className="form-input-premium"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: 'var(--bg-primary)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-light)';
                e.target.style.boxShadow = 'var(--shadow-sm)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Passwords */}
          <div className="form-row" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div className="form-group-premium">
              <label className="form-label-premium" style={{
                display: 'block',
                color: 'var(--text-primary)',
                fontWeight: '600',
                marginBottom: '0.75rem',
                fontSize: '1.25rem'
              }}>Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                className="form-input-premium"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '1.25rem',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-light)';
                  e.target.style.boxShadow = 'var(--shadow-sm)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div className="form-group-premium">
              <label className="form-label-premium" style={{
                display: 'block',
                color: 'var(--text-primary)',
                fontWeight: '600',
                marginBottom: '0.75rem',
                fontSize: '1.25rem'
              }}>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input-premium"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '1.25rem',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-light)';
                  e.target.style.boxShadow = 'var(--shadow-sm)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="role-selection-premium" style={{marginBottom: '2.5rem'}}>
            <label className="form-label-premium" style={{
              display: 'block',
              color: 'var(--text-primary)',
              fontWeight: '600',
              marginBottom: '1rem',
              fontSize: '1.25rem'
            }}>I want to: *</label>
            <div className="radio-group-premium" style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {[
                { value: 'TENANT', icon: '🏠', title: 'Rent a Property', description: 'Find your perfect home' },
                { value: 'LANDLORD', icon: '💰', title: 'List my Property', description: 'Become a property owner' },
                { value: 'MAINTENANCE', icon: '🔧', title: 'Provide Maintenance', description: 'Maintenance staff' }
              ].map((role) => (
                <label
                  key={role.value}
                  className={`radio-option-premium ${formData.role === role.value ? 'selected' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.5rem',
                    background: formData.role === role.value ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
                    border: `2px solid ${formData.role === role.value ? 'var(--primary-light)' : 'rgba(102, 126, 234, 0.2)'}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.role !== role.value) {
                      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.role !== role.value) {
                      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={handleChange}
                    className="radio-input"
                    disabled={loading}
                    style={{
                      marginTop: '0.25rem',
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--primary-light)'
                    }}
                  />
                  <div className="role-icon" style={{
                    fontSize: '3rem',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: formData.role === role.value ? 'var(--primary-gradient)' : 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease'
                  }}>
                    {role.icon}
                  </div>
                  <div style={{flex: 1}}>
                    <div className="role-title" style={{
                      color: 'var(--text-primary)',
                      fontWeight: '600',
                      marginBottom: '0.25rem',
                      fontSize: '2rem'
                    }}>
                      {role.title}
                    </div>
                    <div className="role-description" style={{
                      color: 'var(--text-secondary)',
                      fontSize: '1rem',
                      lineHeight: '1.4'
                    }}>
                      {role.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-premium btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.25rem 2rem',
              background: 'var(--primary-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1.1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '2rem',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-glow)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            {loading ? (
              <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="auth-footer" style={{
            textAlign: 'center',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <p className="auth-link-text" style={{
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              Already have an account?{' '}
              <Link to="/login" className="auth-link" style={{
                color: 'var(--primary-light)',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary-dark)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--primary-light)'}
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .auth-title {
          animation: gradientShift 5s ease infinite;
          background-size: 200% 200%;
        }
      `}</style>
    </div>
    </div>
  );
};

export default SignupForm;
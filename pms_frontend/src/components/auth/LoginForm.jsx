import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Refs to focus inputs on error
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (Object.keys(errors).length > 0) setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!credentials.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!credentials.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Focus first invalid input
      if (validationErrors.email) emailRef.current.focus();
      else if (validationErrors.password) passwordRef.current.focus();

      setIsLoading(false);
      return;
    }

    try {
      const result = await login(credentials.email, credentials.password);

      if (result && result.user) {
        const dashboardPath = getDashboardPath(result.user.role);
        navigate(dashboardPath);
      } else {
        setErrors({ general: 'Invalid email or password. Please try again.' });
      }
    } catch (error) {
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = (error) => {
    const message = error?.response?.data?.message || error.message || 'Login failed';
    let userMessage = '';

    if (message.includes('Invalid credentials') || message.includes('Invalid email or password')) {
      userMessage = 'Invalid email or password. Please check your credentials and try again.';
    } else if (message.includes('User not found')) {
      userMessage = 'No account found with this email. Please sign up first.';
    } else if (message.includes('Network error') || message.includes('Failed to fetch')) {
      userMessage = 'Cannot connect to server. Check your internet and try again.';
    } else {
      userMessage = message;
    }

    setErrors({ general: userMessage });
  };

  const getDashboardPath = (role) => {
    const paths = { LANDLORD: '/owner/dashboard', TENANT: '/tenant/dashboard', ADMIN: '/admin/dashboard', MAINTENANCE: '/maintenance/dashboard' };
    return paths[role] || '/dashboard';
  };

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
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: '0'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-10%',
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
          }}>Welcome Back</h1>
          <p className="auth-subtitle" style={{
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            lineHeight: '1.6'
          }}>Sign in to your account</p>
        </div>

        {/* Display all errors at top */}
        {allErrorMessages.length > 0 && (
          <div className="error-message" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--text-primary)',
            padding: '1.5rem',
            borderRadius: '16px',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            {allErrorMessages.map((msg, i) => (
              <div key={i} style={{marginBottom: i < allErrorMessages.length - 1 ? '0.5rem' : '0'}}>
                {msg}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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
              ref={emailRef}
              type="email"
              name="email"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={handleChange}
              className={`form-input-premium ${errors.email ? 'input-error' : ''}`}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: 'var(--bg-primary)',
                border: `1px solid ${errors.email ? 'rgba(239, 68, 68, 0.5)' : 'rgba(102, 126, 234, 0.3)'}`,
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = errors.email ? 'rgba(239, 68, 68, 0.7)' : 'var(--primary-light)';
                e.target.style.boxShadow = errors.email ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'var(--shadow-sm)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.email ? 'rgba(239, 68, 68, 0.5)' : 'rgba(102, 126, 234, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.email && (
              <div className="field-error" style={{
                color: 'rgba(239, 68, 68, 0.9)',
                fontSize: '0.875rem',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>⚠️</span>
                {errors.email}
              </div>
            )}
          </div>

          {/* Password */}
          <div className="form-group-premium" style={{marginBottom: '2rem'}}>
            <label className="form-label-premium" style={{
              display: 'block',
              color: 'var(--text-primary)',
              fontWeight: '600',
              marginBottom: '0.75rem',
              fontSize: '1.25rem'
            }}>Password *</label>
            <input
              ref={passwordRef}
              type="password"
              name="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              className={`form-input-premium ${errors.password ? 'input-error' : ''}`}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: 'var(--bg-primary)',
                border: `1px solid ${errors.password ? 'rgba(239, 68, 68, 0.5)' : 'rgba(102, 126, 234, 0.3)'}`,
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = errors.password ? 'rgba(239, 68, 68, 0.7)' : 'var(--primary-light)';
                e.target.style.boxShadow = errors.password ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'var(--shadow-sm)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.password ? 'rgba(239, 68, 68, 0.5)' : 'rgba(102, 126, 234, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.password && (
              <div className="field-error" style={{
                color: 'rgba(239, 68, 68, 0.9)',
                fontSize: '0.875rem',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>⚠️</span>
                {errors.password}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`btn-premium btn-primary ${isLoading ? 'btn-loading' : ''}`} 
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1.25rem 2rem',
              background: 'var(--primary-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1.1rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '2rem',
              opacity: isLoading ? 0.7 : 1,
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-glow)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            {isLoading ? (
              <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Footer Links */}
          <div className="auth-footer" style={{
            textAlign: 'center',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <p className="auth-link-text" style={{
              color: 'var(--text-secondary)',
              margin: '0 0 1rem 0',
               fontSize:'1.25rem'
            }}>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link" style={{
                color: 'var(--primary-light)',
                textDecoration: 'none',
                fontSize:'1.25rem',
                fontWeight: '600',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary-dark)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--primary-light)'}
              >
                Sign up here
              </Link>
            </p>
            <p className="auth-link-text" style={{
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              {/* <Link to="/forgot-password" className="auth-link" style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '0.95rem',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                Forgot your password?
              </Link> */}
            </p>
          </div>
        </form>

        {/* Demo Credentials Hint */}
        {/* <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'rgba(102, 126, 234, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          textAlign: 'center'
        }}>
            <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            margin: '0 0 0.5rem 0',
            fontWeight: '500'
          }}>💡 Demo Access</p>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            margin: 0,
            lineHeight: '1.4'
          }}>
            Use your registered credentials to sign in
          </p> 
        </div> */}
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

export default LoginForm;
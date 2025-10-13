import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../common/Header.jsx';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempted:', credentials);
    // Just for demo - in real app, this would handle login
    alert('Login successful! (Demo)');
  };

  return (
    
    <div className="auth-page-premium">
      <Header/>
      <div className="auth-container-premium">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group-premium">
            <label className="form-label-premium">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={handleChange}
              className="form-input-premium"
              required
            />
          </div>

          <div className="form-group-premium">
            <label className="form-label-premium">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              className="form-input-premium"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-premium btn-primary"
          >
            Sign In
          </button>

          <div className="auth-footer">
            <p className="auth-link-text">
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
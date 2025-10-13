import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../common/Header.jsx';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'tenant',
    companyName: '',
    licenseNumber: '',
    employmentStatus: '',
    monthlyIncome: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Just for demo - in real app, this would handle signup
    alert('Account created successfully! (Demo)');
  };

  return (
    <div className="auth-page-premium">
      <Header />
      <div className="auth-container-premium">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join our property rental platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group-premium">
              <label className="form-label-premium">First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input-premium"
                required
              />
            </div>
            <div className="form-group-premium">
              <label className="form-label-premium">Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input-premium"
                required
              />
            </div>
          </div>

          <div className="form-group-premium">
            <label className="form-label-premium">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="form-input-premium"
              required
            />
          </div>

          <div className="form-group-premium">
            <label className="form-label-premium">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="form-input-premium"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group-premium">
              <label className="form-label-premium">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="form-input-premium"
                required
              />
            </div>
            <div className="form-group-premium">
              <label className="form-label-premium">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input-premium"
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="role-selection-premium">
            <label className="form-label-premium">I want to:</label>
            <div className="radio-group-premium">
              <label className={`radio-option-premium ${formData.role === 'tenant' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="tenant"
                  checked={formData.role === 'tenant'}
                  onChange={handleChange}
                  className="radio-input"
                />
                <div className="role-icon">🏠</div>
                <div className="role-title">Rent a Property</div>
                <div className="role-description">Find your perfect home</div>
              </label>
              
              <label className={`radio-option-premium ${formData.role === 'owner' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="owner"
                  checked={formData.role === 'owner'}
                  onChange={handleChange}
                  className="radio-input"
                />
                <div className="role-icon">💰</div>
                <div className="role-title">List my Property</div>
                <div className="role-description">Become a property owner</div>
              </label>
            </div>
          </div>

          {/* Conditional Fields */}
          {formData.role === 'owner' && (
            <div className="conditional-section">
              <h3 className="section-title">Owner Information</h3>
              <div className="form-row">
                <div className="form-group-premium">
                  <label className="form-label-premium">Company Name (Optional)</label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="form-input-premium"
                  />
                </div>
                <div className="form-group-premium">
                  <label className="form-label-premium">License Number (Optional)</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    placeholder="Enter real estate license"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="form-input-premium"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.role === 'tenant' && (
            <div className="conditional-section">
              <h3 className="section-title">Tenant Information</h3>
              <div className="form-row">
                <div className="form-group-premium">
                  <label className="form-label-premium">Employment Status</label>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleChange}
                    className="form-input-premium"
                  >
                    <option value="">Select employment status</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="student">Student</option>
                    <option value="unemployed">Unemployed</option>
                  </select>
                </div>
                <div className="form-group-premium">
                  <label className="form-label-premium">Monthly Income (Optional)</label>
                  <input
                    type="number"
                    name="monthlyIncome"
                    placeholder="Enter monthly income"
                    value={formData.monthlyIncome}
                    onChange={handleChange}
                    className="form-input-premium"
                  />
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-premium btn-primary"
          >
            Create Account
          </button>

          <div className="auth-footer">
            <p className="auth-link-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
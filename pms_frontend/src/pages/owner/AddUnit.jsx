import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';

const AddUnit = ({ onSuccess }) => {
  const { user, properties, addUnit } = useAuth();
  const [formData, setFormData] = useState({
    propertyId: '',
    unitNumber: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    rentAmount: '',
    depositAmount: '',
    status: 'AVAILABLE'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const ownerProperties = properties.filter(prop => prop.landlordId === user.id);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'propertyId':
        if (!value) {
          newErrors.propertyId = 'Please select a property';
        } else {
          delete newErrors.propertyId;
        }
        break;
        
      case 'unitNumber':
        if (!value.trim()) {
          newErrors.unitNumber = 'Unit number is required';
        } else {
          delete newErrors.unitNumber;
        }
        break;
        
      case 'bedrooms':
        if (!value) {
          newErrors.bedrooms = 'Number of bedrooms is required';
        } else if (parseInt(value) < 0) {
          newErrors.bedrooms = 'Bedrooms cannot be negative';
        } else {
          delete newErrors.bedrooms;
        }
        break;
        
      case 'bathrooms':
        if (!value) {
          newErrors.bathrooms = 'Number of bathrooms is required';
        } else if (parseFloat(value) < 0) {
          newErrors.bathrooms = 'Bathrooms cannot be negative';
        } else {
          delete newErrors.bathrooms;
        }
        break;
        
      case 'sqft':
        if (!value) {
          newErrors.sqft = 'Square footage is required';
        } else if (parseInt(value) <= 0) {
          newErrors.sqft = 'Square footage must be greater than 0';
        } else {
          delete newErrors.sqft;
        }
        break;
        
      case 'rentAmount':
        if (!value) {
          newErrors.rentAmount = 'Monthly rent is required';
        } else if (parseFloat(value) <= 0) {
          newErrors.rentAmount = 'Rent amount must be greater than 0';
        } else {
          delete newErrors.rentAmount;
        }
        break;
        
      case 'depositAmount':
        if (!value) {
          newErrors.depositAmount = 'Security deposit is required';
        } else if (parseFloat(value) < 0) {
          newErrors.depositAmount = 'Deposit cannot be negative';
        } else {
          delete newErrors.depositAmount;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    validateField(name, value);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.propertyId) {
      newErrors.propertyId = 'Please select a property';
    }

    if (!formData.unitNumber.trim()) {
      newErrors.unitNumber = 'Unit number is required';
    }

    if (!formData.bedrooms) {
      newErrors.bedrooms = 'Number of bedrooms is required';
    } else if (parseInt(formData.bedrooms) < 0) {
      newErrors.bedrooms = 'Bedrooms cannot be negative';
    }

    if (!formData.bathrooms) {
      newErrors.bathrooms = 'Number of bathrooms is required';
    } else if (parseFloat(formData.bathrooms) < 0) {
      newErrors.bathrooms = 'Bathrooms cannot be negative';
    }

    if (!formData.sqft) {
      newErrors.sqft = 'Square footage is required';
    } else if (parseInt(formData.sqft) <= 0) {
      newErrors.sqft = 'Square footage must be greater than 0';
    }

    if (!formData.rentAmount) {
      newErrors.rentAmount = 'Monthly rent is required';
    } else if (parseFloat(formData.rentAmount) <= 0) {
      newErrors.rentAmount = 'Rent amount must be greater than 0';
    }

    if (!formData.depositAmount) {
      newErrors.depositAmount = 'Security deposit is required';
    } else if (parseFloat(formData.depositAmount) < 0) {
      newErrors.depositAmount = 'Deposit cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstErrorField = document.querySelector('.error-field');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      await addUnit({
        ...formData,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        sqft: parseInt(formData.sqft),
        rentAmount: parseFloat(formData.rentAmount),
        depositAmount: parseFloat(formData.depositAmount)
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding unit:', error);
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach(err => {
          apiErrors[err.path] = err.msg;
        });
        setErrors(apiErrors);
      } else {
        setErrors({ submit: error.response?.data?.message || 'Failed to add unit. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const ErrorMessage = ({ message }) => (
    <div style={{
      color: '#ef4444',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    }}>
      <span style={{ fontSize: '1rem' }}>⚠️</span>
      {message}
    </div>
  );

  return (
    <div className="form-container" style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      <div className="form-header" style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h2 className="form-title" style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          marginBottom: '1rem',
          background: 'var(--gradient-hero)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Add New Unit
        </h2>
        <p className="form-subtitle" style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '500px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Add a new rental unit to your property with complete details
        </p>
      </div>
      
      {errors.submit && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{errors.submit}</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="form-body" style={{
        background: 'var(--bg-card)',
        padding: '3rem',
        borderRadius: '24px',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Property Selection */}
        <div className="form-section" style={{
          marginBottom: '3rem'
        }}>
          <h3 className="section-title" style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '2rem',
            color: 'var(--text-primary)',
            paddingBottom: '1rem',
            borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
          }}>
            Property Selection
          </h3>
          <div className="form-group error-field">
            <label className="form-label" style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              fontSize: '1rem'
            }}>
              Select Property *
            </label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              className="form-select"
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: `1px solid ${errors.propertyId ? '#ef4444' : 'rgba(102, 126, 234, 0.2)'}`,
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              required
            >
              <option value="">Choose a property</option>
              {ownerProperties.map(property => (
                <option key={property._id} value={property._id}>
                  {property.name} - {property.address?.city}
                </option>
              ))}
            </select>
            {errors.propertyId && <ErrorMessage message={errors.propertyId} />}
          </div>
        </div>

        {/* Unit Details */}
        <div className="form-section" style={{
          marginBottom: '3rem'
        }}>
          <h3 className="section-title" style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '2rem',
            color: 'var(--text-primary)',
            paddingBottom: '1rem',
            borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
          }}>
            Unit Details
          </h3>
          <div className="form-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem'
          }}>
            <div className="form-group error-field">
              <label className="form-label" style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}>
                Unit Number *
              </label>
              <input
                type="text"
                name="unitNumber"
                placeholder="e.g., Unit 101, Apt 2B"
                value={formData.unitNumber}
                onChange={handleChange}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: `1px solid ${errors.unitNumber ? '#ef4444' : 'rgba(102, 126, 234, 0.2)'}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease'
                }}
                required
              />
              {errors.unitNumber && <ErrorMessage message={errors.unitNumber} />}
            </div>
            
            <div className="form-group error-field">
              <label className="form-label" style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}>
                Bedrooms *
              </label>
              <input
                type="number"
                name="bedrooms"
                placeholder="Number of bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: `1px solid ${errors.bedrooms ? '#ef4444' : 'rgba(102, 126, 234, 0.2)'}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease'
                }}
                required
                min="0"
              />
              {errors.bedrooms && <ErrorMessage message={errors.bedrooms} />}
            </div>
            
            <div className="form-group error-field">
              <label className="form-label" style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}>
                Bathrooms *
              </label>
              <input
                type="number"
                name="bathrooms"
                placeholder="Number of bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: `1px solid ${errors.bathrooms ? '#ef4444' : 'rgba(102, 126, 234, 0.2)'}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease'
                }}
                required
                min="0"
                step="0.5"
              />
              {errors.bathrooms && <ErrorMessage message={errors.bathrooms} />}
            </div>
            
            <div className="form-group error-field">
              <label className="form-label" style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}>
                Square Footage *
              </label>
              <input
                type="number"
                name="sqft"
                placeholder="Area in square feet"
                value={formData.sqft}
                onChange={handleChange}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: `1px solid ${errors.sqft ? '#ef4444' : 'rgba(102, 126, 234, 0.2)'}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease'
                }}
                required
                min="0"
              />
              {errors.sqft && <ErrorMessage message={errors.sqft} />}
            </div>
          </div>
        </div>

        {/* Pricing & Status */}
        <div className="form-section" style={{
          marginBottom: '3rem'
        }}>
          <h3 className="section-title" style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '2rem',
            color: 'var(--text-primary)',
            paddingBottom: '1rem',
            borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
          }}>
            Pricing & Status
          </h3>
          <div className="form-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem'
          }}>
            <div className="form-group error-field">
              <label className="form-label" style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}>
                Monthly Rent ($) *
              </label>
              <input
                type="number"
                name="rentAmount"
                placeholder="0.00"
                value={formData.rentAmount}
                onChange={handleChange}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: `1px solid ${errors.rentAmount ? '#ef4444' : 'rgba(102, 126, 234, 0.2)'}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease'
                }}
                required
                min="0"
                step="0.01"
              />
              {errors.rentAmount && <ErrorMessage message={errors.rentAmount} />}
            </div>
            
            <div className="form-group error-field">
              <label className="form-label" style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}>
                Security Deposit ($) *
              </label>
              <input
                type="number"
                name="depositAmount"
                placeholder="0.00"
                value={formData.depositAmount}
                onChange={handleChange}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: `1px solid ${errors.depositAmount ? '#ef4444' : 'rgba(102, 126, 234, 0.2)'}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease'
                }}
                required
                min="0"
                step="0.01"
              />
              {errors.depositAmount && <ErrorMessage message={errors.depositAmount} />}
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}>
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                required
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Under Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions" style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <button type="button" className="btn-cancel" style={{
            padding: '1rem 2.5rem',
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.3s ease'
          }}>
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={loading} style={{
            padding: '1rem 2.5rem',
            background: loading ? 'var(--text-muted)' : 'var(--primary-gradient)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-md)',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? (
              <span className="btn-loading" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span className="loading-spinner" style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Adding Unit...
              </span>
            ) : (
              'Add Unit'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUnit;
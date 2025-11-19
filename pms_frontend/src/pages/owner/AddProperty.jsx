import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const AddProperty = ({ onSuccess }) => {
  const { addProperty } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    propertyType: 'APARTMENT',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    amenities: [],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [amenityInput, setAmenityInput] = useState('');
  const [errors, setErrors] = useState({});

 const validateField = (name, value) => {
  const newErrors = { ...errors };
  
  switch (name) {
    case 'name':
      if (!value.trim()) {
        newErrors.name = 'Property name is required';
      } else if (value.trim().length < 2) {
        newErrors.name = 'Property name must be at least 2 characters';
      } else {
        delete newErrors.name;
      }
      break;
      
    case 'address.line1':
      if (!value.trim()) {
        newErrors['address.line1'] = 'Address line 1 is required';
      } else {
        delete newErrors['address.line1'];
      }
      break;
      
    case 'address.city':
      if (!value.trim()) {
        newErrors['address.city'] = 'City is required';
      } else if (/\d/.test(value)) {
        newErrors['address.city'] = 'City should not contain numbers';
      } else {
        delete newErrors['address.city'];
      }
      break;
      
    case 'address.state':
      if (!value.trim()) {
        newErrors['address.state'] = 'State is required';
      } else if (/\d/.test(value)) {
        newErrors['address.state'] = 'State should not contain numbers';
      } else {
        delete newErrors['address.state'];
      }
      break;
      
    case 'address.country':
      if (!value.trim()) {
        newErrors['address.country'] = 'Country is required';
      } else if (/\d/.test(value)) {
        newErrors['address.country'] = 'Country should not contain numbers';
      } else {
        delete newErrors['address.country'];
      }
      break;
      
    case 'address.postalCode':
      if (!value.trim()) {
        newErrors['address.postalCode'] = 'Postal code is required';
      } else if (!/^[A-Za-z0-9]{6}$/.test(value)) {
        newErrors['address.postalCode'] = 'Postal code must be exactly 6 alphanumeric characters';
      } else {
        delete newErrors['address.postalCode'];
      }
      break;
      
    default:
      break;
  }
  
  setErrors(newErrors);
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
      validateField(name, value);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
      validateField(name, value);
    }
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      if (!formData.amenities.includes(amenityInput.trim())) {
        setFormData({
          ...formData,
          amenities: [...formData.amenities, amenityInput.trim()]
        });
        setAmenityInput('');
        // Clear amenity errors if any
        const newErrors = { ...errors };
        delete newErrors.amenities;
        setErrors(newErrors);
      } else {
        setErrors({ ...errors, amenities: 'This amenity has already been added' });
      }
    } else {
      setErrors({ ...errors, amenities: 'Please enter an amenity' });
    }
  };

  const handleRemoveAmenity = (amenityToRemove) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(amenity => amenity !== amenityToRemove)
    });
  };

  const validateForm = () => {
  const newErrors = {};

  // Validate required fields
  if (!formData.name.trim()) {
    newErrors.name = 'Property name is required';
  }

  if (!formData.address.line1.trim()) {
    newErrors['address.line1'] = 'Address line 1 is required';
  }

  if (!formData.address.city.trim()) {
    newErrors['address.city'] = 'City is required';
  } else if (/\d/.test(formData.address.city)) {
    newErrors['address.city'] = 'City should not contain numbers';
  }

  if (!formData.address.state.trim()) {
    newErrors['address.state'] = 'State is required';
  } else if (/\d/.test(formData.address.state)) {
    newErrors['address.state'] = 'State should not contain numbers';
  }

  if (!formData.address.country.trim()) {
    newErrors['address.country'] = 'Country is required';
  } else if (/\d/.test(formData.address.country)) {
    newErrors['address.country'] = 'Country should not contain numbers';
  }

  if (!formData.address.postalCode.trim()) {
    newErrors['address.postalCode'] = 'Postal code is required';
  }
  else if (formData.address.postalCode.length !== 6) {
    newErrors['address.postalCode'] = 'Postal code must be exactly 6 digits';
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.error-field');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      await addProperty(formData);
      onSuccess();
    } catch (error) {
      console.error('Error adding property:', error);
      // Handle API errors
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach(err => {
          apiErrors[err.path] = err.msg;
        });
        setErrors(apiErrors);
      } else {
        setErrors({ submit: error.response?.data?.message || 'Failed to add property. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName];
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
          Add New Property
        </h2>
        <p className="form-subtitle" style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '500px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Create a new property listing with all necessary details
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
        {/* Basic Information Section */}
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
            Basic Information
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
                Property Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Sunshine Apartments"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: `1px solid ${errors.name ? '#ef4444' : 'rgba(102, 126, 234, 0.2)'}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease'
                }}
                required
              />
              {errors.name && <ErrorMessage message={errors.name} />}
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}>
                Property Type *
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
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
                <option value="HOUSE">House</option>
                <option value="APARTMENT">Apartment</option>
                <option value="CONDO">Condo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Section */}
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
            Address Details
          </h3>
          <div className="form-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem'
          }}>
            <div className="form-group error-field" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}>
                Address Line 1 *
              </label>
              <input
                type="text"
                name="address.line1"
                placeholder="Street address"
                value={formData.address.line1}
                onChange={handleChange}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: `1px solid ${errors['address.line1'] ? '#ef4444' : 'rgba(102, 126, 234, 0.2)'}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease'
                }}
                required
              />
              {errors['address.line1'] && <ErrorMessage message={errors['address.line1']} />}
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}>
                Address Line 2
              </label>
              <input
                type="text"
                name="address.line2"
                placeholder="Apartment, suite, unit, etc."
                value={formData.address.line2}
                onChange={handleChange}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
            
            <div className="form-group error-field">
  <label className="form-label" style={{
    display: 'block',
    marginBottom: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontSize: '1rem'
  }}>
    City *
  </label>
  <input
    type="text"
    name="address.city"
    placeholder="City"
    value={formData.address.city}
    onChange={handleChange}
    className="form-input"
    style={{
      width: '100%',
      padding: '1rem 1.25rem',
      border: `1px solid ${errors['address.city'] ? '#ef4444' : 'rgba(102, 126, 234, 0.2)'}`,
      borderRadius: '12px',
      fontSize: '1rem',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'all 0.3s ease'
    }}
    required
  />
  {errors['address.city'] && <ErrorMessage message={errors['address.city']} />}
</div>

<div className="form-group error-field">
  <label className="form-label" style={{
    display: 'block',
    marginBottom: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontSize: '1rem'
  }}>
    State *
  </label>
  <input
    type="text"
    name="address.state"
    placeholder="State"
    value={formData.address.state}
    onChange={handleChange}
    className="form-input"
    style={{
      width: '100%',
      padding: '1rem 1.25rem',
      border: `1px solid ${errors['address.state'] ? '#ef4444' : 'rgba(102, 126, 234, 0.2)'}`,
      borderRadius: '12px',
      fontSize: '1rem',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'all 0.3s ease'
    }}
    required
  />
  {errors['address.state'] && <ErrorMessage message={errors['address.state']} />}
</div>

<div className="form-group error-field">
  <label className="form-label" style={{
    display: 'block',
    marginBottom: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontSize: '1rem'
  }}>
    Country *
  </label>
  <input
    type="text"
    name="address.country"
    placeholder="Country"
    value={formData.address.country}
    onChange={handleChange}
    className="form-input"
    style={{
      width: '100%',
      padding: '1rem 1.25rem',
      border: `1px solid ${errors['address.country'] ? '#ef4444' : 'rgba(102, 126, 234, 0.2)'}`,
      borderRadius: '12px',
      fontSize: '1rem',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'all 0.3s ease'
    }}
    required
  />
  {errors['address.country'] && <ErrorMessage message={errors['address.country']} />}
</div>

<div className="form-group error-field">
  <label className="form-label" style={{
    display: 'block',
    marginBottom: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontSize: '1rem'
  }}>
    Postal Code *
  </label>
  <input
    type="text"
    name="address.postalCode"
    placeholder="Postal Code (6 characters)"
    value={formData.address.postalCode}
    onChange={handleChange}
    className="form-input"
    style={{
      width: '100%',
      padding: '1rem 1.25rem',
      border: `1px solid ${errors['address.postalCode'] ? '#ef4444' : 'rgba(102, 126, 234, 0.2)'}`,
      borderRadius: '12px',
      fontSize: '1rem',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'all 0.3s ease'
    }}
    maxLength={6}
    required
  />
  {errors['address.postalCode'] && <ErrorMessage message={errors['address.postalCode']} />}
</div>
          </div>
        </div>

        {/* Amenities Section */}
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
    Amenities
  </h3>
  <div className="form-group">
    <label className="form-label" style={{
      display: 'block',
      marginBottom: '0.75rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      fontSize: '1rem'
    }}>
      Add Amenities
    </label>
    <div className="amenities-input" style={{
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem'
    }}>
      <input
        type="text"
        value={amenityInput}
        onChange={(e) => {
          // Only allow letters and spaces
          const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
          setAmenityInput(value);
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddAmenity();
          }
        }}
        placeholder="Add amenity (e.g., Parking, Gym)"
        className="form-input"
        style={{
          flex: '1',
          padding: '1rem 1.25rem',
          border: `1px solid ${errors.amenities ? '#ef4444' : 'rgba(102, 126, 234, 0.2)'}`,
          borderRadius: '12px',
          fontSize: '1rem',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          transition: 'all 0.3s ease'
        }}
      />
      <button
        type="button"
        onClick={handleAddAmenity}
        className="btn-add"
        style={{
          padding: '1rem 2rem',
          background: 'var(--accent-teal)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '1rem',
          transition: 'all 0.3s ease',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        Add
      </button>
    </div>
    {errors.amenities && <ErrorMessage message={errors.amenities} />}
    <div className="amenities-list" style={{
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap'
    }}>
      {formData.amenities.map((amenity, index) => (
        <span key={index} className="amenity-tag" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(102, 126, 234, 0.1)',
          color: 'var(--text-primary)',
          padding: '0.75rem 1.25rem',
          borderRadius: '20px',
          fontSize: '0.9rem',
          fontWeight: '500',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          transition: 'all 0.3s ease'
        }}>
          {amenity}
          <button
            type="button"
            onClick={() => handleRemoveAmenity(amenity)}
            className="btn-remove"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '0',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.3s ease'
            }}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  </div>
</div>

        {/* Notes Section */}
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
            Additional Notes
          </h3>
          <div className="form-group">
            <label className="form-label" style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              fontSize: '1rem'
            }}>
              Notes
            </label>
            <textarea
              name="notes"
              rows={4}
              placeholder="Any additional notes about the property..."
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: '1px solid rgba(102, 126, 234, 0.2)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                resize: 'vertical',
                minHeight: '120px',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit'
              }}
            />
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
                Adding...
              </span>
            ) : (
              'Add Property'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
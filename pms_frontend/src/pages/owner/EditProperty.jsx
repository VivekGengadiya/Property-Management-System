import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const EditProperty = ({ property, onSuccess, onCancel }) => {
  const { updateProperty } = useAuth();
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

  // Initialize form with property data
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        propertyType: property.propertyType || 'APARTMENT',
        address: {
          line1: property.address?.line1 || '',
          line2: property.address?.line2 || '',
          city: property.address?.city || '',
          state: property.address?.state || '',
          country: property.address?.country || '',
          postalCode: property.address?.postalCode || ''
        },
        amenities: property.amenities || [],
        notes: property.notes || ''
      });
    }
  }, [property]);

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
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()]
      });
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (amenityToRemove) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(amenity => amenity !== amenityToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProperty(property._id, formData);
      onSuccess();
    } catch (error) {
      console.error('Error updating property:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!property) return null;

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">Edit Property</h2>
        <p className="form-subtitle">Update property information</p>
      </div>
      
      <form onSubmit={handleSubmit} className="form-body">
        {/* Basic Information Section */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Property Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Sunshine Apartments"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Property Type</label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="form-select"
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
        {/* <div className="form-section">
          <h3 className="section-title">Address</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Address Line 1</label>
              <input
                type="text"
                name="address.line1"
                placeholder="Street address"
                value={formData.address.line1}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Address Line 2</label>
              <input
                type="text"
                name="address.line2"
                placeholder="Apartment, suite, unit, etc."
                value={formData.address.line2}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="address.city"
                placeholder="City"
                value={formData.address.city}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="address.state"
                placeholder="State"
                value={formData.address.state}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                name="address.country"
                placeholder="Country"
                value={formData.address.country}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input
                type="text"
                name="address.postalCode"
                placeholder="Postal Code"
                value={formData.address.postalCode}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div> */}

        {/* Amenities Section */}
        <div className="form-section">
          <h3 className="section-title">Amenities</h3>
          <div className="form-group">
            <label className="form-label">Add Amenities</label>
            <div className="amenities-input">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                placeholder="Add amenity (e.g., Parking, Gym)"
                className="form-input"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="btn-add"
              >
                Add
              </button>
            </div>
            <div className="amenities-list">
              {formData.amenities.map((amenity, index) => (
                <span key={index} className="amenity-tag">
                  {amenity}
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(amenity)}
                    className="btn-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="form-section">
          <h3 className="section-title">Additional Notes</h3>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Any additional notes about the property..."
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="loading-spinner"></span>
                Updating...
              </span>
            ) : (
              'Update Property'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProperty;
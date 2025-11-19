import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const EditUnit = ({ unit, onSuccess, onCancel }) => {
  const { updateUnit, properties } = useAuth();
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

  // Initialize form with unit data
  useEffect(() => {
    if (unit) {
      setFormData({
        propertyId: unit.propertyId || '',
        unitNumber: unit.unitNumber || '',
        bedrooms: unit.bedrooms?.toString() || '',
        bathrooms: unit.bathrooms?.toString() || '',
        sqft: unit.sqft?.toString() || '',
        rentAmount: unit.rentAmount?.toString() || '',
        depositAmount: unit.depositAmount?.toString() || '',
        status: unit.status || 'AVAILABLE'
      });
    }
  }, [unit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUnit(unit._id, {
        ...formData,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        sqft: parseInt(formData.sqft),
        rentAmount: parseFloat(formData.rentAmount),
        depositAmount: parseFloat(formData.depositAmount)
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating unit:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!unit) return null;

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">Edit Unit</h2>
        <p className="form-subtitle">Update unit information</p>
      </div>
      
      <form onSubmit={handleSubmit} className="form-body">
        {/* Property Selection */}
        <div className="form-section">
          <h3 className="section-title">Property Selection</h3>
          <div className="form-group">
            <label className="form-label">Select Property</label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Choose a property</option>
              {properties.map(property => (
                <option key={property._id} value={property._id}>
                  {property.name} - {property.address?.city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Unit Details */}
        <div className="form-section">
          <h3 className="section-title">Unit Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Unit Number</label>
              <input
                type="text"
                name="unitNumber"
                placeholder="e.g., Unit 101, Apt 2B"
                value={formData.unitNumber}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                placeholder="Number of bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="form-input"
                required
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                placeholder="Number of bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="form-input"
                required
                min="0"
                step="0.5"
              />
            </div>
            
            {/* <div className="form-group">
              <label className="form-label">Square Footage</label>
              <input
                type="number"
                name="sqft"
                placeholder="Area in square feet"
                value={formData.sqft}
                onChange={handleChange}
                className="form-input"
                required
                min="0"
              />
            </div> */}
          </div>
        </div>

        {/* Pricing & Status */}
        <div className="form-section">
          <h3 className="section-title">Pricing & Status</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Monthly Rent ($)</label>
              <input
                type="number"
                name="rentAmount"
                placeholder="0.00"
                value={formData.rentAmount}
                onChange={handleChange}
                className="form-input"
                required
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Security Deposit ($)</label>
              <input
                type="number"
                name="depositAmount"
                placeholder="0.00"
                value={formData.depositAmount}
                onChange={handleChange}
                className="form-input"
                required
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Under Maintenance</option>
              </select>
            </div>
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
              'Update Unit'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUnit;
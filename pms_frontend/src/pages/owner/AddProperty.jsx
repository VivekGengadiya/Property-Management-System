import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const AddProperty = ({ onSuccess }) => {
  const { addProperty } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'apartment',
    rentPrice: '',
    securityDeposit: '',
    areaSqft: '',
    bedrooms: '',
    bathrooms: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      addProperty({
        ...formData,
        rentPrice: parseFloat(formData.rentPrice),
        securityDeposit: parseFloat(formData.securityDeposit),
        areaSqft: parseInt(formData.areaSqft),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms)
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error adding property:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Property</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Property Title"
          name="title"
          placeholder="e.g., Luxury 3BHK Apartment with Sea View"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="Describe your property in detail..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
            required
          />
        </div>

        <Input
          label="Full Address"
          name="address"
          placeholder="Enter complete address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="City"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
          />
          <Input
            label="State"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            required
          />
          <Input
            label="ZIP Code"
            name="zipCode"
            placeholder="ZIP Code"
            value={formData.zipCode}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
              required
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="studio">Studio</option>
              <option value="villa">Villa</option>
            </select>
          </div>

          <Input
            label="Monthly Rent ($)"
            type="number"
            name="rentPrice"
            placeholder="0.00"
            value={formData.rentPrice}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Security Deposit ($)"
            type="number"
            name="securityDeposit"
            placeholder="0.00"
            value={formData.securityDeposit}
            onChange={handleChange}
            required
          />
          <Input
            label="Area (sq ft)"
            type="number"
            name="areaSqft"
            placeholder="Square footage"
            value={formData.areaSqft}
            onChange={handleChange}
            required
          />
          <Input
            label="Bedrooms"
            type="number"
            name="bedrooms"
            placeholder="Number of bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Bathrooms"
          type="number"
          step="0.5"
          name="bathrooms"
          placeholder="Number of bathrooms"
          value={formData.bathrooms}
          onChange={handleChange}
          required
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full md:w-auto"
        >
          Add Property
        </Button>
      </form>
    </Card>
  );
};

export default AddProperty;
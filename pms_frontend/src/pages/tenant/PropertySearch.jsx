import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';


const PropertySearch = () => {
  const { properties, createLeaseAgreement, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const availableProperties = properties.filter(prop => prop.listingStatus === 'available');
  
  const cities = [...new Set(availableProperties.map(prop => prop.city))];

  const filteredProperties = availableProperties.filter(prop => {
    const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prop.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || prop.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const handleRent = (propertyId) => {
    const agreementData = {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rentAmount: properties.find(p => p.id === propertyId).rentPrice,
      securityDeposit: properties.find(p => p.id === propertyId).securityDeposit
    };

    createLeaseAgreement(propertyId, user.id, agreementData);
    alert('Congratulations! You have successfully rented this property.');
  };

  return (
    <div>
      {/* Search Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            {filteredProperties.length} properties found
          </div>
        </div>
      </Card>

      {/* Property Grid */}
      {filteredProperties.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600">Try adjusting your search criteria.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img
                  src={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>
                
                <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
                  <span>🏠 {property.bedrooms} bed</span>
                  <span>🚿 {property.bathrooms} bath</span>
                  <span>📏 {property.areaSqft} sqft</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-primary-600">
                    ${property.rentPrice}/month
                  </span>
                  <span className="text-gray-600 text-sm">{property.city}, {property.state}</span>
                </div>
                
                <Button
                  onClick={() => handleRent(property.id)}
                  className="w-full"
                >
                  Rent Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertySearch;
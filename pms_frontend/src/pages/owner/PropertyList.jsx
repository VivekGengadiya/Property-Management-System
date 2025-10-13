import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';

const PropertyList = () => {
  const { user, properties } = useAuth();
  
  const ownerProperties = properties.filter(prop => prop.ownerId === user.id);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (ownerProperties.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500 mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏠</span>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties listed</h3>
        <p className="text-gray-600">Get started by adding your first property to rent.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ownerProperties.map(property => (
        <Card key={property.id} className="overflow-hidden">
          <div className="aspect-w-16 aspect-h-9 bg-gray-200">
            <img
              src={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'}
              alt={property.title}
              className="w-full h-48 object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.listingStatus)}`}>
                {property.listingStatus}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span>🏠 {property.bedrooms} bed • {property.bathrooms} bath</span>
              <span>📏 {property.areaSqft} sqft</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary-600">
                ${property.rentPrice}/month
              </span>
              <span className="text-gray-600 text-sm">{property.city}, {property.state}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PropertyList;
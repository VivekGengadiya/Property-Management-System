export const mockUsers = [
  {
    id: 1,
    email: 'owner@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    role: 'owner',
    companyName: 'Elite Realty',
    dateCreated: '2024-01-15'
  },
  {
    id: 2,
    email: 'tenant@example.com',
    password: 'password123',
    firstName: 'Alice',
    lastName: 'Smith',
    phoneNumber: '+0987654321',
    role: 'tenant',
    employmentStatus: 'employed',
    monthlyIncome: 5000,
    dateCreated: '2024-01-20'
  }
];

export const mockProperties = [
  {
    id: 1,
    ownerId: 1,
    title: 'Luxury 3BHK Apartment with Sea View',
    description: 'Beautiful apartment with modern amenities, located in prime area with swimming pool and gym access.',
    address: '123 Ocean Drive',
    city: 'Miami',
    state: 'Florida',
    zipCode: '33101',
    propertyType: 'apartment',
    rentPrice: 2500,
    securityDeposit: 2500,
    areaSqft: 1200,
    bedrooms: 3,
    bathrooms: 2,
    listingStatus: 'available',
    dateListed: '2024-01-16',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400'
    ]
  },
  {
    id: 2,
    ownerId: 1,
    title: 'Cozy Studio in Downtown',
    description: 'Perfect for students or young professionals, fully furnished studio with all utilities included.',
    address: '456 City Center',
    city: 'New York',
    state: 'New York',
    zipCode: '10001',
    propertyType: 'studio',
    rentPrice: 1200,
    securityDeposit: 1200,
    areaSqft: 500,
    bedrooms: 1,
    bathrooms: 1,
    listingStatus: 'available',
    dateListed: '2024-01-18',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'
    ]
  }
];

export const mockLeaseAgreements = [
  {
    id: 1,
    propertyId: 1,
    tenantId: 2,
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    rentAmount: 2500,
    securityDeposit: 2500,
    status: 'active'
  }
];
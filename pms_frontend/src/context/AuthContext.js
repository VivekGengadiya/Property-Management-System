import React, { createContext, useState, useContext, useEffect } from 'react';
import { mockUsers, mockProperties, mockLeaseAgreements } from '../data/mockData.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState(mockProperties);
  const [leaseAgreements, setLeaseAgreements] = useState(mockLeaseAgreements);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Mock login function
  const login = async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(u => u.email === email && u.password === password);
        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          const token = 'mock-jwt-token-' + Date.now();
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          setUser(userWithoutPassword);
          resolve({ user: userWithoutPassword, token });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  };

  // Mock signup function
  const signup = async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
          reject(new Error('User already exists with this email'));
        } else {
          const newUser = {
            id: mockUsers.length + 1,
            ...userData,
            dateCreated: new Date().toISOString()
          };
          const { password: _, ...userWithoutPassword } = newUser;
          const token = 'mock-jwt-token-' + Date.now();
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          setUser(userWithoutPassword);
          resolve({ user: userWithoutPassword, token });
        }
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Property management functions
  const addProperty = (propertyData) => {
    const newProperty = {
      id: properties.length + 1,
      ownerId: user.id,
      listingStatus: 'available',
      dateListed: new Date().toISOString(),
      images: [],
      ...propertyData
    };
    setProperties([...properties, newProperty]);
    return newProperty;
  };

  const createLeaseAgreement = (propertyId, tenantId, agreementData) => {
    const newAgreement = {
      id: leaseAgreements.length + 1,
      propertyId,
      tenantId,
      status: 'active',
      ...agreementData
    };
    setLeaseAgreements([...leaseAgreements, newAgreement]);
    
    // Update property status
    setProperties(properties.map(prop => 
      prop.id === propertyId ? { ...prop, listingStatus: 'occupied' } : prop
    ));
    
    return newAgreement;
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    properties,
    leaseAgreements,
    addProperty,
    createLeaseAgreement
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
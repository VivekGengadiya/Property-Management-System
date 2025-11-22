import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, propertyAPI, unitAPI, leaseAPI } from '../services/api.js';

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
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [leaseAgreements, setLeaseAgreements] = useState([]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Only fetch data if user is authenticated
        await fetchProperties();
        await fetchUnits();
        await fetchLeases();
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const fetchProperties = async () => {
    try {
      const response = await propertyAPI.getProperties();
      setProperties(response.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await unitAPI.getUnits();
      setUnits(response.data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]);
    }
  };

 const fetchLeases = async () => {
  try {
    let response;

    if (user.role === "LANDLORD") {
      response = await leaseAPI.listForLandlord();
    } else if (user.role === "TENANT") {
      response = await leaseAPI.listForTenant();
    } else {
      response = { data: [] };
    }

    setLeaseAgreements(response.data || []);
  } catch (error) {
    console.error('Error fetching leases:', error);
    setLeaseAgreements([]);
  }
};


  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log('AuthContext: Making login API call...');
      const response = await authAPI.login({ email, password });
      const data = response; // Since apiCall already returns data

      console.log('AuthContext: API response:', data);

      if (data.success && data.token && data.user) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);

        console.log('AuthContext: Login successful, user:', data.user);

        // Return the result for the login form to use
        return { user: data.user, token: data.token };
      } else {
        console.error('AuthContext: Login failed - no token or user:', data);
        throw new Error(data.message || 'Login failed - no token received');
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      
      let errorMessage = 'Network error. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      const data = response;

      if (data.success) {
        // Auto-login after successful registration
        const loginResponse = await authAPI.login({ 
          email: userData.email, 
          password: userData.password 
        });
        const loginData = loginResponse;

        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        setUser(loginData.user);

        return { user: loginData.user, token: loginData.token };
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      let errorMessage = 'Network error. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProperties([]);
    setUnits([]);
    setLeaseAgreements([]);
  };

  const getRoleDashboardPath = (userRole) => {
    switch (userRole) {
      case 'LANDLORD':
        return '/owner/dashboard';
      case 'TENANT':
        return '/tenant/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  };

const addProperty = async (propertyData) => {
  console.log('Adding property:', propertyData);
  try {
    // Expect propertyData.address = { line1, line2, city, state, country, postalCode }
    const payload = {
      ...propertyData,
      landlordId: user.id || user._id,
      // Do NOT spread address to root; keep nested
      address: {
        line1: propertyData.address?.line1 ?? "",
        line2: propertyData.address?.line2 ?? "",
        city: propertyData.address?.city ?? "",
        state: propertyData.address?.state ?? "",
        country: propertyData.address?.country ?? "",
        postalCode: propertyData.address?.postalCode ?? ""
      }
    };

    const response = await propertyAPI.createProperty(payload);
    console.log('Property API response:', response);

    if (response.success) {
      setProperties(prev => [...prev, response.data]);
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to add property');
    }
  } catch (error) {
    console.error('Error adding property:', error);
    throw error;
  }
};


  const addUnit = async (unitData) => {
    console.log('Adding unit:', unitData);
    try {
      // Use the unitAPI service instead of direct fetch
      const response = await unitAPI.createUnit(unitData);
      
      console.log('Unit API response:', response);
      
      if (response.success) {
        setUnits(prev => [...prev, response.data]);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add unit');
      }
    } catch (error) {
      console.error('Error adding unit:', error);
      throw error;
    }
  };

  const deleteProperty = async (propertyId) => {
    try {
      // Use the propertyAPI service instead of direct fetch
      const response = await propertyAPI.deleteProperty(propertyId);
      
      if (response.success) {
        setProperties(prev => prev.filter(prop => prop._id !== propertyId));
        // Also remove units associated with this property
        setUnits(prev => prev.filter(unit => unit.propertyId !== propertyId));
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  };

  const deleteUnit = async (unitId) => {
    try {
      // Use the unitAPI service instead of direct fetch
      const response = await unitAPI.deleteUnit(unitId);
      
      if (response.success) {
        setUnits(prev => prev.filter(unit => unit._id !== unitId));
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete unit');
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      throw error;
    }
  };

  const updateProperty = async (propertyId, propertyData) => {
  console.log('Updating property:', propertyId, propertyData);
  try {
    const response = await propertyAPI.updateProperty(propertyId, propertyData);
    
    console.log('Property update response:', response);
    
    if (response.success) {
      setProperties(prev => prev.map(prop => 
        prop._id === propertyId ? { ...prop, ...response.data } : prop
      ));
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update property');
    }
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};

const updateUnit = async (unitId, unitData) => {
  console.log('Updating unit:', unitId, unitData);
  try {
    const response = await unitAPI.updateUnit(unitId, unitData);
    
    console.log('Unit update response:', response);
    
    if (response.success) {
      setUnits(prev => prev.map(unit => 
        unit._id === unitId ? { ...unit, ...response.data } : unit
      ));
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update unit');
    }
  } catch (error) {
    console.error('Error updating unit:', error);
    throw error;
  }
};

  const createLeaseAgreement = async (leaseData) => {
    try {
      const response = await leaseAPI.create(leaseData);
      
      if (response.success) {
        setLeaseAgreements((prev) => [...prev, response.data]);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create lease agreement');
      }
    } catch (error) {
      let errorMessage = 'Network error. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    properties,
    units,
    leaseAgreements,
    addProperty,
    createLeaseAgreement,
    getRoleDashboardPath,
    addUnit,
    deleteProperty,
    deleteUnit,
    updateProperty,
    updateUnit,
    refreshProperties: fetchProperties,
    refreshUnits: fetchUnits,
    refreshLeases: fetchLeases,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
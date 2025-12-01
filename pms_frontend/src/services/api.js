const API_BASE_URL = import.meta.env.VITE_API_URL;


// Generic API call function with auth
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
console.log('🔐 API Call Debug:', {
    endpoint,
    tokenExists: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
  });

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Add body to config if it exists and method is not GET/HEAD
  if (options.body && !['GET', 'HEAD'].includes(options.method?.toUpperCase())) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle non-JSON responses (like HTML errors)
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || 'Server error');
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Call failed for ${endpoint}:`, error);
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check your connection.');
    }
    
    throw error;
  }
};

// Specific API functions - UPDATED TO MATCH YOUR BACKEND ROUTES
export const authAPI = {
  login: (credentials) => apiCall('/users/login', {
    method: 'POST',
    body: credentials,
  }),
  
  register: (userData) => apiCall('/users/register', {
    method: 'POST',
    body: userData,
  }),

  getProfile: () => apiCall('/users/profile'),
  
  updateProfile: (userData) => apiCall('/users/profile', {
    method: 'PUT',
    body: userData,
  }),
};

export const propertyAPI = {
  // Use the correct endpoints from your backend
  getProperties: () => apiCall('/properties'), // Changed from getMyProperties
  getAllProperties: () => apiCall('/properties'),
  getProperty: (id) => apiCall(`/properties/${id}`),
  createProperty: (propertyData) => apiCall('/properties', {
    method: 'POST',
    body: propertyData,
  }),
  updateProperty: (id, propertyData) => apiCall(`/properties/${id}`, {
    method: 'PUT',
    body: propertyData,
  }),
  deleteProperty: (id) => apiCall(`/properties/${id}`, {
    method: 'DELETE',
  }),
};

export const unitAPI = {
  // Use the correct endpoints from your backend
  getUnits: () => apiCall('/units'), // Changed to match your unitRoutes
  getUnitsByProperty: (propertyId) => apiCall(`/units?propertyId=${propertyId}`),
  getUnit: (id) => apiCall(`/units/${id}`),
  createUnit: (unitData) => apiCall('/units', {
    method: 'POST',
    body: unitData,
  }),
  updateUnit: (id, unitData) => apiCall(`/units/${id}`, {
    method: 'PUT',
    body: unitData,
  }),
  deleteUnit: (id) => apiCall(`/units/${id}`, {
    method: 'DELETE',
  }),
};

// landlord specific APIs
export const applicationsAPI = {

  listForTenant: () => apiCall("/applications/my", { method: "GET" }),

  listForLandlord(status) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiCall(`/applications/landlord${qs}`, { method: "GET" });
  },
  approve(id) {
    return apiCall(`/applications/${id}/approve`, { method: "PATCH" });
  },
  reject(id) {
    return apiCall(`/applications/${id}/reject`, { method: "PATCH" });
  }
};


export const applicationAPI = {
  getApplications: () => apiCall('/applications'),
  getApplication: (id) => apiCall(`/applications/${id}`),
  createApplication: (applicationData) => apiCall('/applications', {
    method: 'POST',
    body: applicationData,
  }),
  updateApplication: (id, applicationData) => apiCall(`/applications/${id}`, {
    method: 'PUT',
    body: applicationData,
  }),
};

export const leaseAPI = {
  // LANDLORD: list leases for my properties
  listForLandlord: () => apiCall('/leases/landlord'),

  // TENANT: list my leases
  listForTenant: () => apiCall('/leases/my'),

  // LANDLORD: create lease after approving application
  create: (data) => apiCall('/leases', {
    method: 'POST',
    body: data, // will include applicationId, dates + extra professional fields
  }),

  // TENANT: respond to lease
  respond: (id, data) => apiCall(`/leases/${id}/respond`, {
    method: 'PUT',
    body: data,
  }),

  // LANDLORD: terminate lease
  terminate: (id) => apiCall(`/leases/${id}/terminate`, {
    method: 'PUT',
  }),
};

export const invoiceAPI = {
  getInvoices: () => apiCall('/invoices'),
  getInvoice: (id) => apiCall(`/invoices/${id}`),
  createInvoice: (invoiceData) => apiCall('/invoices', {
    method: 'POST',
    body: invoiceData,
  }),
  payInvoice: (id) => apiCall(`/invoices/${id}/pay`, {
    method: 'POST',
  }),
};

export const paymentAPI = {
  getPayments: () => apiCall('/payments'),
  getPayment: (id) => apiCall(`/payments/${id}`),
  processPayment: (paymentData) => apiCall('/payments', {
    method: 'POST',
    body: paymentData,
  }),
};

export const maintenanceAPI = {
  getMaintenanceRequests: () => apiCall('/maintenance'),
  getMaintenanceRequest: (id) => apiCall(`/maintenance/${id}`),
  createMaintenanceRequest: (requestData) => apiCall('/maintenance', {
    method: 'POST',
    body: requestData,
  }),
  updateMaintenanceRequest: (id, requestData) => apiCall(`/maintenance/${id}`, {
    method: 'PUT',
    body: requestData,
  })};

// Upload API for file uploads
export const uploadAPI = {
  uploadFile: (formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
  },
};

// Health check

export const healthCheck = () => apiCall('/health');

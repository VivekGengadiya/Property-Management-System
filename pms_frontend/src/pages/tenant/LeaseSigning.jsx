// src/pages/tenant/LeaseSigning.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar.jsx';
import Footer from '../../components/common/Footer.jsx';
import { apiCall } from "../../services/api";

const LeaseSigning = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { applicationId, unitId, propertyId, tenantId } = location.state || {};
  
  const [formData, setFormData] = useState({
    applicationId: applicationId || '',
    startDate: '',
    endDate: '',
    dueDay: 1
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [application, setApplication] = useState(null);
  const [unit, setUnit] = useState(null);
  const [property, setProperty] = useState(null);

  useEffect(() => {
    if (!applicationId) {
      setError('No application selected for lease creation');
      return;
    }
    fetchApplicationDetails();
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
  try {
    const token = localStorage.getItem('token');

    const data = await apiCall(`/applications/${applicationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (data.success) {
      setApplication(data.data);

      // --- Set default start/end dates ---
      const today = new Date();
      const oneYearLater = new Date(today);
      oneYearLater.setFullYear(today.getFullYear() + 1);

      setFormData((prev) => ({
        ...prev,
        startDate: today.toISOString().split("T")[0],
        endDate: oneYearLater.toISOString().split("T")[0],
      }));

      // --- Fetch unit details ---
      const unitId =
        typeof data.data.unitId === "string"
          ? data.data.unitId
          : data.data.unitId?._id;

      if (unitId) {
        await fetchUnitDetails(unitId);
      }
    } else {
      setError(data.message || "Failed to load application details");
    }
  } catch (err) {
    console.error("Error fetching application:", err);
    setError("Failed to load application details");
  }
};


 const fetchUnitDetails = async (unitId) => {
  try {
    const token = localStorage.getItem('token');

    const data = await apiCall(`/units/${unitId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (data.success) {
      setUnit(data.data);

      // Extract propertyId correctly (string OR populated object)
      const propertyId =
        typeof data.data.propertyId === "string"
          ? data.data.propertyId
          : data.data.propertyId?._id;

      if (propertyId) {
        await fetchPropertyDetails(propertyId);
      }

    } else {
      console.error("Failed to load unit:", data.message);
    }

  } catch (err) {
    console.error("Error fetching unit:", err);
  }
};

 const fetchPropertyDetails = async (propertyId) => {
  try {
    const token = localStorage.getItem("token");

    const data = await apiCall(`/properties/${propertyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (data.success) {
      setProperty(data.data);
    } else {
      console.error("Failed to load property:", data.message);
    }

  } catch (err) {
    console.error("Error fetching property:", err);
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Please login to create lease");
    }

    const data = await apiCall(`/leases`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: formData, // apiCall already stringifies body
    });

    // apiCall already throws on error, so here data.success is guaranteed

    if (data.success) {
      setSuccess("Lease created successfully!");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/payment", {
          state: {
            leaseId: data.data._id,
            amount: data.data.rentAmount,
            depositAmount: data.data.depositAmount,
          },
        });
      }, 2000);
    } else {
      throw new Error(data.message || "Lease creation failed");
    }

  } catch (err) {
    console.error("Lease creation error:", err);
    setError(err.message || "Failed to create lease. Please try again.");
  } finally {
    setLoading(false);
  }
};


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getPropertyAddress = (property) => {
    if (!property) return 'Location not specified';
    
    if (typeof property.address === 'object' && property.address !== null) {
      const addressParts = [];
      if (property.address.street) addressParts.push(property.address.street);
      if (property.address.city) addressParts.push(property.address.city);
      if (property.address.state) addressParts.push(property.address.state);
      return addressParts.length > 0 ? addressParts.join(', ') : 'Location not specified';
    }
    
    const addressParts = [];
    if (property.address) addressParts.push(property.address);
    if (property.city) addressParts.push(property.city);
    if (property.state) addressParts.push(property.state);
    
    return addressParts.length > 0 ? addressParts.join(', ') : 'Location not specified';
  };

  if (!applicationId) {
    return (
      <div className="dashboard-container" style={{background: 'var(--bg-primary)', minHeight: '100vh'}}>
        <Navbar />
        <div className="premium-container">
          <div className="error-state" style={{
            textAlign: 'center', 
            padding: '5rem 2rem',
            background: 'var(--bg-card)',
            borderRadius: '20px',
            border: '1px solid rgba(90, 122, 110, 0.1)',
            marginTop: '2rem'
          }}>
            <div style={{
              fontSize: '5rem', 
              marginBottom: '1.5rem',
              filter: 'drop-shadow(0 4px 12px rgba(90, 122, 110, 0.3))'
            }}>❌</div>
            <h3 style={{
              color: 'var(--text-primary)', 
              marginBottom: '1rem',
              fontSize: '1.75rem',
              fontWeight: '700'
            }}>No Application Selected</h3>
            <p style={{
              color: 'var(--text-secondary)', 
              marginBottom: '2.5rem',
              fontSize: '1.1rem'
            }}>
              Please select an application to create a lease.
            </p>
            <Link to="/landlord/applications" className="btn-premium btn-primary" style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'var(--primary-gradient)',
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '600',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.3s ease'
            }}>
              Back to Applications
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{background: 'var(--bg-primary)', minHeight: '100vh'}}>
      <Navbar />
      
      <div className="premium-container" style={{maxWidth: '1000px', margin: '0 auto', padding: '0 1rem'}}>
        {/* Breadcrumb */}
        <nav className="breadcrumb" style={{
          marginBottom: '2rem', 
          marginTop: '2rem', 
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Link to="/landlord/dashboard" className="breadcrumb-link" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Dashboard
          </Link>
          <span style={{color: 'var(--text-muted)'}}>/</span>
          <Link to="/landlord/applications" className="breadcrumb-link" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Applications
          </Link>
          <span style={{color: 'var(--text-muted)'}}>/</span>
          <span className="breadcrumb-current" style={{
            color: 'var(--text-primary)',
            fontWeight: '600'
          }}>Create Lease</span>
        </nav>

        {/* Page Header */}
        <div className="page-header" style={{
          textAlign: 'center',
          marginBottom: '3rem',
          padding: '2rem 0'
        }}>
          <h1 className="page-title" style={{
            fontSize: '3rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            background: 'var(--gradient-hero)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Create Lease Agreement</h1>
          <p className="page-subtitle" style={{
            fontSize: '1.3rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Set up the lease terms for the approved application
          </p>
        </div>

        {/* Application Summary */}
        {application && (
          <div className="application-summary-card" style={{
            background: 'var(--bg-card)',
            padding: '2.5rem',
            borderRadius: '20px',
            border: '1px solid rgba(90, 122, 110, 0.1)',
            boxShadow: 'var(--shadow-lg)',
            marginBottom: '2.5rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
              background: 'var(--gradient-hero)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Application Summary</h3>
            <div className="summary-content" style={{
              display: 'grid',
              gap: '1rem'
            }}>
              <div className="summary-item" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(90, 122, 110, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(90, 122, 110, 0.1)'
              }}>
                <strong style={{color: 'var(--text-primary)'}}>Applicant:</strong> 
                <span style={{color: 'var(--text-secondary)'}}>
                  {application.tenantId?.name || 'N/A'}
                </span>
              </div>
              
              {unit && (
                <div className="summary-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(90, 122, 110, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(90, 122, 110, 0.1)'
                }}>
                  <strong style={{color: 'var(--text-primary)'}}>Unit:</strong> 
                  <span style={{color: 'var(--text-secondary)'}}>
                    Unit {unit.unitNumber}
                  </span>
                </div>
              )}
              
              {property && (
                <div className="summary-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(90, 122, 110, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(90, 122, 110, 0.1)'
                }}>
                  <strong style={{color: 'var(--text-primary)'}}>Property:</strong> 
                  <span style={{color: 'var(--text-secondary)'}}>
                    {property.name}
                  </span>
                </div>
              )}
              
              {unit && (
                <div className="summary-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(90, 122, 110, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(90, 122, 110, 0.1)'
                }}>
                  <strong style={{color: 'var(--text-primary)'}}>Monthly Rent:</strong> 
                  <span style={{
                    color: 'var(--accent-green)',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>{formatCurrency(unit.rentAmount)}</span>
                </div>
              )}
              
              {property && (
                <div className="summary-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(90, 122, 110, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(90, 122, 110, 0.1)'
                }}>
                  <strong style={{color: 'var(--text-primary)'}}>Location:</strong> 
                  <span style={{color: 'var(--text-secondary)'}}>
                    {getPropertyAddress(property)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="alert alert-error" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--text-primary)',
            padding: '1.5rem',
            borderRadius: '16px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}>
            <div className="alert-icon" style={{fontSize: '1.5rem'}}>⚠️</div>
            <div className="alert-content">
              <strong style={{display: 'block', marginBottom: '0.5rem'}}>Error:</strong> {error}
            </div>
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--text-primary)',
            padding: '1.5rem',
            borderRadius: '16px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}>
            <div className="alert-icon" style={{fontSize: '1.5rem'}}>✅</div>
            <div className="alert-content">
              <strong style={{display: 'block', marginBottom: '0.5rem'}}>Success:</strong> {success}
            </div>
          </div>
        )}

        {/* Lease Form */}
        <form onSubmit={handleSubmit} className="lease-form" style={{
          background: 'var(--bg-card)',
          padding: '3rem',
          borderRadius: '24px',
          border: '1px solid rgba(90, 122, 110, 0.1)',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '3rem'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '2rem',
            background: 'var(--gradient-hero)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Lease Terms</h2>

          <div className="form-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginBottom: '2.5rem'
          }}>
            <div className="form-group">
              <label className="form-label" style={{
                display: 'block',
                color: 'var(--text-primary)',
                fontWeight: '600',
                marginBottom: '0.75rem',
                fontSize: '1.1rem'
              }}>
                Lease Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid rgba(90, 122, 110, 0.3)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-light)';
                  e.target.style.boxShadow = 'var(--shadow-sm)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(90, 122, 110, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{
                display: 'block',
                color: 'var(--text-primary)',
                fontWeight: '600',
                marginBottom: '0.75rem',
                fontSize: '1.1rem'
              }}>
                Lease End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid rgba(90, 122, 110, 0.3)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-light)';
                  e.target.style.boxShadow = 'var(--shadow-sm)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(90, 122, 110, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{marginBottom: '2.5rem'}}>
            <label className="form-label" style={{
              display: 'block',
              color: 'var(--text-primary)',
              fontWeight: '600',
              marginBottom: '0.75rem',
              fontSize: '1.1rem'
            }}>
              Rent Due Day *
            </label>
            <select
              name="dueDay"
              value={formData.dueDay}
              onChange={handleInputChange}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                background: 'var(--bg-primary)',
                border: '1px solid rgba(90, 122, 110, 0.3)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                outline: 'none',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-light)';
                e.target.style.boxShadow = 'var(--shadow-sm)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(90, 122, 110, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>
                  {day} {day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month
                </option>
              ))}
            </select>
            <div className="form-hint" style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              marginTop: '0.5rem'
            }}>
              Select the day of the month when rent is due
            </div>
          </div>

          {/* Lease Terms Summary */}
          <div className="lease-terms-summary" style={{
            background: 'rgba(90, 122, 110, 0.05)',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid rgba(90, 122, 110, 0.1)',
            marginBottom: '2.5rem'
          }}>
            <h4 style={{
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
              fontSize: '1.3rem',
              fontWeight: '700'
            }}>Lease Summary</h4>
            <div className="terms-grid" style={{
              display: 'grid',
              gap: '1rem'
            }}>
              <div className="term-item" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(90, 122, 110, 0.1)',
                borderRadius: '8px'
              }}>
                <strong style={{color: 'var(--text-primary)'}}>Lease Duration:</strong>
                <span style={{color: 'var(--text-secondary)'}}>
                  {formData.startDate && formData.endDate ? 
                    `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(formData.endDate).toLocaleDateString()}` : 
                    'Not set'
                  }
                </span>
              </div>
              
              {unit && (
                <div className="term-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(90, 122, 110, 0.1)',
                  borderRadius: '8px'
                }}>
                  <strong style={{color: 'var(--text-primary)'}}>Monthly Rent:</strong>
                  <span style={{color: 'var(--accent-green)', fontWeight: '600'}}>
                    {formatCurrency(unit.rentAmount)}
                  </span>
                </div>
              )}
              
              {unit && (
                <div className="term-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(90, 122, 110, 0.1)',
                  borderRadius: '8px'
                }}>
                  <strong style={{color: 'var(--text-primary)'}}>Security Deposit:</strong>
                  <span style={{color: 'var(--text-secondary)', fontWeight: '600'}}>
                    {formatCurrency(unit.depositAmount || unit.rentAmount)}
                  </span>
                </div>
              )}
              
              <div className="term-item" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(90, 122, 110, 0.1)',
                borderRadius: '8px'
              }}>
                <strong style={{color: 'var(--text-primary)'}}>Rent Due Date:</strong>
                <span style={{color: 'var(--text-secondary)'}}>
                  {formData.dueDay ? `${formData.dueDay}${formData.dueDay === 1 ? 'st' : formData.dueDay === 2 ? 'nd' : formData.dueDay === 3 ? 'rd' : 'th'} of each month` : 'Not set'}
                </span>
              </div>
            </div>
          </div>

          <div className="form-actions" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Link 
              to="/landlord/applications"
              className="btn-premium btn-secondary"
              style={{
                padding: '1rem 2rem',
                background: 'rgba(90, 122, 110, 0.1)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(90, 122, 110, 0.3)',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(90, 122, 110, 0.2)';
                e.target.style.borderColor = 'rgba(90, 122, 110, 0.5)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(90, 122, 110, 0.1)';
                e.target.style.borderColor = 'rgba(90, 122, 110, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              ← Back to Applications
            </Link>
            
            <button
              type="submit"
              className="btn-premium btn-primary"
              disabled={loading}
              style={{
                padding: '1rem 2rem',
                background: 'var(--primary-gradient)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                minWidth: '180px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = 'var(--shadow-glow)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              {loading ? (
                <span className="btn-loading-content" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span className="loading-spinner" style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  Creating Lease...
                </span>
              ) : (
                'Create Lease & Continue to Payment →'
              )}
            </button>
          </div>
        </form>

        {/* Important Information */}
        <div className="important-info" style={{
          background: 'var(--bg-card)',
          padding: '2.5rem',
          borderRadius: '20px',
          border: '1px solid rgba(90, 122, 110, 0.1)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '1.5rem',
            textAlign: 'center',
            background: 'var(--gradient-hero)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Important Information</h3>
          <div className="info-content" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '📝',
                title: 'Lease Agreement',
                description: 'This creates a legally binding lease agreement between landlord and tenant.'
              },
              {
                icon: '💰',
                title: 'Payment Required',
                description: 'Tenant will need to pay security deposit and first month\'s rent to activate the lease.'
              },
              {
                icon: '⏳',
                title: 'Pending Status',
                description: 'Lease will be in pending status until tenant accepts and completes payment.'
              }
            ].map((item, index) => (
              <div key={index} className="info-item" style={{
                textAlign: 'center',
                padding: '2rem 1.5rem',
                background: 'rgba(90, 122, 110, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(90, 122, 110, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.background = 'rgba(90, 122, 110, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(90, 122, 110, 0.05)';
              }}
              >
                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>{item.icon}</div>
                <strong style={{
                  display: 'block',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                  fontSize: '1.1rem'
                }}>{item.title}</strong>
                <p style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '0',
                  lineHeight: '1.6'
                }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LeaseSigning;
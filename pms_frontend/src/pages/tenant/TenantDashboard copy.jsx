import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Navbar.jsx';
import Footer from '../../components/common/Footer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const TenantDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  console.log(units);

  useEffect(() => {
    fetchProperties();
    fetchUnits();
  }, []);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view properties');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:9000/api/properties', {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
        throw new Error(`Failed to fetch properties: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setProperties(data.data || []);
      } else {
        setError(data.message || 'Failed to load properties');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      if (err.message.includes('Network error') || err.message.includes('Failed to fetch')) {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError('Failed to load properties. Please try again later.');
      }
    }
  };

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view units');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:9000/api/units', {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }
        throw new Error(`Failed to fetch units: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Units data:', data);
      if (data.success) {
        setUnits(data.data || []);
      } else {
        setError(data.message || 'Failed to load units');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching units:', err);
      if (err.message.includes('Network error') || err.message.includes('Failed to fetch')) {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError('Failed to load available units. Please try again later.');
      }
      setLoading(false);
    }
  };

  const getUnitsForProperty = (propertyId) => {
    return units.filter(unit => unit.propertyId === propertyId && unit.status === 'AVAILABLE');
  };

  const getPropertyImage = (property) => {
    if (property.images && property.images.length > 0) {
      if (property.images[0].startsWith('http')) {
        return property.images[0];
      }
      return `http://localhost:9000${property.images[0]}`;
    }
    return 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  };

  const getUnitImage = (unit) => {
    if (unit.images && unit.images.length > 0) {
      if (unit.images[0].startsWith('http')) {
        return unit.images[0];
      }
      return `http://localhost:9000${unit.images[0]}`;
    }
    return 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  };

  // Safe function to get min rent
  const getMinRent = (propertyUnits) => {
    const availableRents = propertyUnits
      .filter(unit => unit.rentAmount && unit.rentAmount > 0)
      .map(unit => unit.rentAmount);
    
    return availableRents.length > 0 ? Math.min(...availableRents) : null;
  };

  // Safe function to get bedroom range
  const getBedroomRange = (propertyUnits) => {
    const bedrooms = propertyUnits
      .filter(unit => unit.bedrooms && unit.bedrooms > 0)
      .map(unit => unit.bedrooms);
    
    if (bedrooms.length === 0) return 'N/A';
    
    const minBeds = Math.min(...bedrooms);
    const maxBeds = Math.max(...bedrooms);
    
    return minBeds === maxBeds ? `${minBeds}` : `${minBeds}-${maxBeds}`;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="premium-container">
          <div className="loading-spinner" style={{textAlign: 'center', padding: '4rem'}}>
            <div className="loading-spinner-premium" style={{
              width: '60px', 
              height: '60px', 
              margin: '0 auto 2rem',
              border: '4px solid rgba(102, 126, 234, 0.2)',
              borderTop: '4px solid var(--primary-light)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{color: 'var(--text-secondary)'}}>Loading available properties...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{background: 'var(--bg-primary)', minHeight: '100vh'}}>
      <Header />
      <div className="premium-container">
        {/* Dashboard Header */}
        <div className="dashboard-header" style={{
          textAlign: 'center', 
          marginBottom: '3rem', 
          padding: '4rem 0 2rem'
        }}>
          <h1 className="dashboard-title" style={{
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '1rem',
            background: 'var(--gradient-hero)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {user ? `Welcome back, ${user.name}!` : 'Find Your Dream Home'}
          </h1>
          <p className="dashboard-subtitle" style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Discover perfectly curated rental properties tailored to your lifestyle and preferences
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{
            marginBottom: '2rem', 
            padding: '1.5rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            color: 'var(--text-primary)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <span style={{fontSize: '1.25rem'}}>⚠️</span>
              <span>{error}</span>
            </div>
            {error.includes('Please login') && (
              <div style={{marginTop: '1rem'}}>
                <Link to="/login" className="btn-premium btn-primary" style={{
                  padding: '0.75rem 1.5rem', 
                  fontSize: '0.9rem',
                  display: 'inline-block'
                }}>
                  Login Now
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Stats Overview */}
        <div className="stats-grid-premium" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          <div className="stat-card-premium" style={{
            background: 'var(--bg-card)',
            padding: '2.5rem 2rem',
            borderRadius: '20px',
            textAlign: 'center',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div className="stat-icon-premium" style={{
              fontSize: '3rem', 
              marginBottom: '1.5rem',
              filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))'
            }}>🏠</div>
            <div className="stat-number-premium" style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              background: 'var(--gradient-hero)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.5rem'
            }}>{properties.length}</div>
            <div className="stat-label-premium" style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Premium Properties</div>
          </div>
          
          <div className="stat-card-premium" style={{
            background: 'var(--bg-card)',
            padding: '2.5rem 2rem',
            borderRadius: '20px',
            textAlign: 'center',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div className="stat-icon-premium" style={{
              fontSize: '3rem', 
              marginBottom: '1.5rem',
              filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))'
            }}>🔍</div>
            <div className="stat-number-premium" style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              background: 'var(--gradient-hero)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.5rem'
            }}>
              {units.filter(unit => unit.status === 'AVAILABLE').length}
            </div>
            <div className="stat-label-premium" style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Available Units</div>
          </div>
          
          <div className="stat-card-premium" style={{
            background: 'var(--bg-card)',
            padding: '2.5rem 2rem',
            borderRadius: '20px',
            textAlign: 'center',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div className="stat-icon-premium" style={{
              fontSize: '3rem', 
              marginBottom: '1.5rem',
              filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))'
            }}>💰</div>
            <div className="stat-number-premium" style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              background: 'var(--gradient-hero)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.5rem'
            }}>
              {(() => {
                const availableUnitsWithRent = units.filter(unit => 
                  unit.status === 'AVAILABLE' && unit.rentAmount && unit.rentAmount > 0
                );
                if (availableUnitsWithRent.length > 0) {
                  const minRent = Math.min(...availableUnitsWithRent.map(unit => unit.rentAmount));
                  return `$${minRent}`;
                }
                return '$0';
              })()}
            </div>
            <div className="stat-label-premium" style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Starting From</div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="properties-section" style={{marginBottom: '5rem'}}>
          <div style={{textAlign: 'center', marginBottom: '4rem'}}>
            <h2 className="section-title" style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              marginBottom: '1rem',
              background: 'var(--gradient-hero)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Featured Properties</h2>
            <p className="section-subtitle" style={{
              fontSize: '1.2rem',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Discover your perfect home from our verified property listings
            </p>
          </div>

          {properties.length === 0 ? (
            <div className="empty-state" style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              background: 'var(--bg-card)',
              borderRadius: '20px',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <div className="empty-state-icon" style={{
                fontSize: '5rem', 
                marginBottom: '1.5rem',
                filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))'
              }}>🏠</div>
              <h3 style={{
                fontSize: '1.75rem', 
                color: 'var(--text-primary)', 
                marginBottom: '1rem',
                fontWeight: '700'
              }}>No Properties Available</h3>
              <p style={{
                color: 'var(--text-secondary)', 
                marginBottom: '2rem',
                fontSize: '1.1rem'
              }}>Check back later for new property listings</p>
              {!localStorage.getItem('token') && (
                <Link to="/login" className="btn-premium btn-primary" style={{
                  display: 'inline-block',
                  padding: '1rem 2rem',
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  marginTop: '1rem',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.3s ease'
                }}>
                  Login to View Properties
                </Link>
              )}
            </div>
          ) : (
            <div className="properties-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '2.5rem'
            }}>
              {properties.map(property => {
                const propertyUnits = getUnitsForProperty(property._id);
                const minRent = getMinRent(propertyUnits);
                const bedroomRange = getBedroomRange(propertyUnits);
                
                return (
                  <div key={property._id} className="property-card-premium" style={{
                    background: 'var(--bg-card)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}>
                    <div className="property-image-container" style={{
                      position: 'relative',
                      overflow: 'hidden',
                      height: '280px'
                    }}>
                      <img 
                        src={getPropertyImage(property)} 
                        alt={property.name || 'Property'}
                        className="property-image"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="property-badge" style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        background: 'var(--primary-gradient)',
                        color: 'white',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        boxShadow: 'var(--shadow-md)',
                        zIndex: '2'
                      }}>
                        {property.propertyType || 'PROPERTY'}
                      </div>
                      {propertyUnits.length > 0 && (
                        <div className="property-badge available" style={{
                          position: 'absolute',
                          top: '3.5rem',
                          left: '1rem',
                          background: 'var(--accent-teal)',
                          color: 'white',
                          padding: '0.5rem 1.5rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          boxShadow: 'var(--shadow-md)',
                          zIndex: '2'
                        }}>
                          {propertyUnits.length} Unit{propertyUnits.length > 1 ? 's' : ''} Available
                        </div>
                      )}
                    </div>
                    
                    <div className="property-content" style={{padding: '2rem'}}>
                      <div className="property-price" style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        background: 'var(--gradient-hero)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: '0.75rem'
                      }}>
                        {minRent ? `$${minRent}` : 'Contact for price'}
                        {minRent && <span style={{
                          fontSize: '1rem', 
                          color: 'var(--text-muted)',
                          fontWeight: '500'
                        }}>/month</span>}
                      </div>
                      
                      <h3 className="property-title" style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: '1rem'
                      }}>{property.name || 'Unnamed Property'}</h3>
                      
                      <div className="property-description" style={{
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6',
                        marginBottom: '1.5rem',
                        fontSize: '1rem'
                      }}>
                        {property.description || 'Beautiful property in a great location with modern amenities and convenient access to local facilities.'}
                      </div>

                      {propertyUnits.length > 0 && (
                        <>
                          <div className="property-features" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            background: 'rgba(102, 126, 234, 0.05)',
                            borderRadius: '16px',
                            border: '1px solid rgba(102, 126, 234, 0.1)'
                          }}>
                            <div className="feature" style={{textAlign: 'center'}}>
                              <div className="feature-value" style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                color: 'var(--accent-teal)',
                                marginBottom: '0.25rem'
                              }}>
                                {propertyUnits.length}
                              </div>
                              <div className="feature-label" style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}>Available</div>
                            </div>
                            <div className="feature" style={{textAlign: 'center'}}>
                              <div className="feature-value" style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                color: 'var(--accent-teal)',
                                marginBottom: '0.25rem'
                              }}>
                                {bedroomRange}
                              </div>
                              <div className="feature-label" style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}>Beds</div>
                            </div>
                            <div className="feature" style={{textAlign: 'center'}}>
                              <div className="feature-value" style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                color: 'var(--accent-teal)',
                                marginBottom: '0.25rem'
                              }}>
                                {propertyUnits.some(unit => unit.bathrooms) ? 'Yes' : 'No'}
                              </div>
                              <div className="feature-label" style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}>Baths</div>
                            </div>
                          </div>

                          <div className="property-footer">
                            <Link 
                              to={`/property/${property._id}`}
                              className="btn-premium btn-primary"
                              style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'center',
                                padding: '1rem 2rem',
                                background: 'var(--primary-gradient)',
                                color: 'white',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                boxShadow: 'var(--shadow-md)',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem'
                              }}
                            >
                              View Available Units
                            </Link>
                          </div>
                        </>
                      )}

                      {propertyUnits.length === 0 && (
                        <div className="no-units-message" style={{
                          textAlign: 'center',
                          padding: '1.5rem',
                          background: 'rgba(245, 158, 11, 0.1)',
                          borderRadius: '12px',
                          color: 'var(--text-primary)',
                          border: '1px solid rgba(245, 158, 11, 0.2)'
                        }}>
                          <p style={{margin: 0, fontWeight: '500'}}>No units currently available. Check back soon!</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Units Section */}
        {units.filter(unit => unit.status === 'AVAILABLE').length > 0 && (
          <div className="units-section" style={{marginBottom: '5rem'}}>
            <div style={{textAlign: 'center', marginBottom: '4rem'}}>
              <h2 className="section-title" style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                marginBottom: '1rem',
                background: 'var(--gradient-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Available Units</h2>
              <p className="section-subtitle" style={{
                fontSize: '1.2rem',
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Browse individual units ready for immediate rental with detailed specifications
              </p>
            </div>
            
            <div className="units-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '2rem'
            }}>
              {units.filter(unit => unit.status === 'AVAILABLE').map(unit => {
                const property = properties.find(p => p._id === unit.propertyId);
                return (
                  <div key={unit._id} className="unit-card" style={{
                    background: 'var(--bg-card)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="unit-image-container" style={{
                      position: 'relative',
                      overflow: 'hidden',
                      height: '220px'
                    }}>
                      <img 
                        src={getUnitImage(unit)} 
                        alt={`Unit ${unit.unitNumber}`}
                        className="unit-image"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="unit-badge" style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'var(--accent-teal)',
                        color: 'white',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        boxShadow: 'var(--shadow-md)'
                      }}>Available Now</div>
                    </div>
                    
                    <div className="unit-content" style={{padding: '2rem'}}>
                      <div className="unit-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1.5rem'
                      }}>
                        <h3 className="unit-title" style={{
                          fontSize: '1.4rem',
                          fontWeight: '700',
                          color: 'var(--text-primary)'
                        }}>Unit {unit.unitNumber}</h3>
                        <div className="unit-price" style={{
                          fontSize: '1.5rem',
                          fontWeight: '800',
                          color: 'var(--accent-teal)'
                        }}>
                          ${unit.rentAmount || 'N/A'}<span style={{
                            fontSize: '1rem', 
                            color: 'var(--text-muted)',
                            fontWeight: '500'
                          }}>/month</span>
                        </div>
                      </div>
                      
                      <div className="unit-features" style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap'
                      }}>
                        {unit.bedrooms && (
                          <div className="unit-feature" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'rgba(102, 126, 234, 0.1)',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(102, 126, 234, 0.2)'
                          }}>
                            <span className="feature-icon">🛏️</span>
                            {unit.bedrooms} Bed{unit.bedrooms > 1 ? 's' : ''}
                          </div>
                        )}
                        {unit.bathrooms && (
                          <div className="unit-feature" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'rgba(102, 126, 234, 0.1)',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(102, 126, 234, 0.2)'
                          }}>
                            <span className="feature-icon">🚿</span>
                            {unit.bathrooms} Bath{unit.bathrooms > 1 ? 's' : ''}
                          </div>
                        )}
                        {unit.sqft && (
                          <div className="unit-feature" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'rgba(102, 126, 234, 0.1)',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(102, 126, 234, 0.2)'
                          }}>
                            <span className="feature-icon">📏</span>
                            {unit.sqft} sqft
                          </div>
                        )}
                      </div>
                      
                      <div className="unit-deposit" style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem',
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(102, 126, 234, 0.05)',
                        borderRadius: '10px',
                        border: '1px solid rgba(102, 126, 234, 0.1)'
                      }}>
                        <strong>Security Deposit:</strong> ${unit.depositAmount || unit.rentAmount || 'N/A'}
                      </div>
                      
                      <div className="unit-actions">
                        <Link 
                          to={`/unit/${unit._id}`}
                          className="btn-premium btn-primary"
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'center',
                            padding: '1rem 2rem',
                            background: 'var(--primary-gradient)',
                            color: 'white',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: 'var(--shadow-md)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem'
                          }}
                        >
                          View Details & Apply Now
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Login Prompt if no token */}
        {!localStorage.getItem('token') && properties.length === 0 && (
          <div className="login-prompt" style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--gradient-card)',
            borderRadius: '24px',
            marginTop: '3rem',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              fontSize: '4rem', 
              marginBottom: '1.5rem',
              filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))'
            }}>🔐</div>
            <h3 style={{
              color: 'var(--text-primary)', 
              marginBottom: '1rem', 
              fontSize: '2rem',
              fontWeight: '700'
            }}>Access Premium Listings</h3>
            <p style={{
              color: 'var(--text-secondary)', 
              marginBottom: '2.5rem', 
              fontSize: '1.2rem',
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Login to explore our exclusive collection of premium rental properties
            </p>
            <Link to="/login" className="btn-premium btn-primary" style={{
              display: 'inline-block',
              padding: '1rem 2.5rem',
              background: 'var(--primary-gradient)',
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.1rem',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.3s ease'
            }}>
              Login to Continue
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TenantDashboard;
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar.jsx';
import Footer from '../../components/common/Footer.jsx';

const UnitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    fetchUnitDetail();
  }, [id]);

  const fetchUnitDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Fetch unit details
      const unitResponse = await apiCall(`
/units/${id}`, {
        headers
      });
      
      if (!unitResponse.ok) throw new Error('Failed to fetch unit details');
      
      const unitData = await unitResponse.json();
      
      if (unitData.success) {
        setUnit(unitData.data);
        
        // Fetch property details if propertyId exists
        if (unitData.data.propertyId) {
          await fetchPropertyDetails(unitData.data.propertyId, headers);
        }
      } else {
        setError(unitData.message || 'Failed to load unit details');
      }
    } catch (err) {
      setError('Failed to load unit details. Please try again later.');
      console.error('Error fetching unit:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyDetails = async (propertyId, headers) => {
    try {
      const propertyResponse = await apiCall(`
/properties/${propertyId}`, {
        headers
      });
      
      if (propertyResponse.ok) {
        const propertyData = await propertyResponse.json();
        if (propertyData.success) {
          setProperty(propertyData.data);
        }
      }
    } catch (err) {
      console.error('Error fetching property:', err);
    }
  };

  // Safe data access functions
  const getUnitImage = (imagePath, index = 0) => {
    if (unit?.images && unit.images.length > index) {
      const img = unit.images[index];
      if (img.startsWith('http')) return img;
      return `http://localhost:9000${img}`;
    }
    return 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
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

  const getPropertyName = (property) => {
    if (!property) return 'Unnamed Property';
    return typeof property.name === 'string' ? property.name : 'Unnamed Property';
  };

  const handleApplyNow = () => {
    setShowApplicationModal(true);
  };

  const handleConfirmApplication = () => {
    // Navigate to application page with unit data
    navigate('/apply', { 
      state: { 
        unitId: unit._id,
        unitNumber: unit.unitNumber,
        propertyId: unit.propertyId,
        rentAmount: unit.rentAmount,
        propertyName: property?.name
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{background: 'var(--bg-primary)', minHeight: '100vh'}}>
        <Navbar />
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
            <p style={{color: 'var(--text-secondary)'}}>Loading unit details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="dashboard-container" style={{background: 'var(--bg-primary)', minHeight: '100vh'}}>
        <Navbar />
        <div className="premium-container">
          <div className="error-state" style={{
            textAlign: 'center', 
            padding: '5rem 2rem',
            background: 'var(--bg-card)',
            borderRadius: '20px',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            marginTop: '2rem'
          }}>
            <div style={{
              fontSize: '5rem', 
              marginBottom: '1.5rem',
              filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))'
            }}>❌</div>
            <h3 style={{
              color: 'var(--text-primary)', 
              marginBottom: '1rem',
              fontSize: '1.75rem',
              fontWeight: '700'
            }}>
              {error || 'Unit Not Found'}
            </h3>
            <p style={{
              color: 'var(--text-secondary)', 
              marginBottom: '2.5rem',
              fontSize: '1.1rem'
            }}>
              {error || 'The unit you\'re looking for doesn\'t exist or is no longer available.'}
            </p>
            <Link to="/tenant/dashboard" className="btn-premium btn-primary" style={{
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
              Back to Properties
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const unitImages = unit.images && unit.images.length > 0 ? unit.images : [getUnitImage()];
  const isAvailable = unit.status === 'AVAILABLE';

  return (
    <div className="dashboard-container" style={{background: 'var(--bg-primary)', minHeight: '100vh'}}>
      <Navbar />
      
      {/* Unit Detail Content */}
      <div className="premium-container" style={{maxWidth: '1200px', margin: '0 auto', padding: '0 1rem'}}>
        {/* Breadcrumb */}
        <nav className="breadcrumb" style={{
          marginBottom: '2rem', 
          marginTop: '2rem', 
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Link to="/tenant/dashboard" className="breadcrumb-link" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Properties
          </Link>
          {property && (
            <>
              <span style={{color: 'var(--text-muted)'}}>/</span>
              <Link to={`/property/${property._id}`} className="breadcrumb-link" style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                {getPropertyName(property)}
              </Link>
            </>
          )}
          <span style={{color: 'var(--text-muted)'}}>/</span>
          <span className="breadcrumb-current" style={{
            color: 'var(--text-primary)',
            fontWeight: '600'
          }}>Unit {unit.unitNumber}</span>
        </nav>

        {/* Unit Header */}
        <div className="unit-detail-header" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '3rem',
          marginBottom: '4rem'
        }}>
          <div className="unit-image-gallery">
            <div className="unit-main-image" style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              marginBottom: '1rem'
            }}>
              <img 
                src={getUnitImage(unitImages[activeImageIndex])}
                alt={`Unit ${unit.unitNumber}`}
                className="gallery-main-img"
                style={{
                  width: '100%',
                  height: '500px',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease'
                }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                }}
              />
              {!isAvailable && (
                <div className="unit-status-badge unavailable" style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  boxShadow: 'var(--shadow-md)',
                  backdropFilter: 'blur(10px)'
                }}>
                  {unit.status || 'UNAVAILABLE'}
                </div>
              )}
            </div>
            
            {unitImages.length > 1 && (
              <div className="unit-image-thumbnails" style={{
                display: 'flex',
                gap: '0.75rem',
                overflowX: 'auto',
                padding: '0.5rem 0'
              }}>
                {unitImages.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail-btn ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                    style={{
                      flex: '0 0 auto',
                      width: '80px',
                      height: '60px',
                      border: `2px solid ${index === activeImageIndex ? 'var(--primary-light)' : 'rgba(102, 126, 234, 0.2)'}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: 'none',
                      padding: 0,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <img 
                      src={getUnitImage(image, index)}
                      alt={`Thumbnail ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="unit-detail-sidebar" style={{
            background: 'var(--bg-card)',
            padding: '2.5rem',
            borderRadius: '24px',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            boxShadow: 'var(--shadow-lg)',
            height: 'fit-content',
            position: 'sticky',
            top: '2rem'
          }}>
            <div className="unit-badge" style={{
              display: 'inline-block',
              background: 'var(--primary-gradient)',
              color: 'white',
              padding: '0.5rem 1.5rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-md)'
            }}>{unit.propertyType || 'UNIT'}</div>
            
            <h1 className="unit-detail-title" style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
              lineHeight: '1.2'
            }}>Unit {unit.unitNumber}</h1>
            
            {property && (
              <div className="unit-property-info" style={{marginBottom: '2rem'}}>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem'
                }}>{getPropertyName(property)}</h3>
                <p className="unit-address" style={{
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem'
                }}>📍 {getPropertyAddress(property)}</p>
              </div>
            )}

            <div className="unit-pricing-card" style={{
              background: 'rgba(102, 126, 234, 0.05)',
              padding: '2rem',
              borderRadius: '20px',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              marginBottom: '2rem'
            }}>
              <div className="unit-price-main" style={{
                fontSize: '3rem',
                fontWeight: '800',
                background: 'var(--gradient-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '1.5rem',
                lineHeight: '1'
              }}>
                {formatCurrency(unit.rentAmount)}
                <span style={{
                  fontSize: '1.5rem', 
                  color: 'var(--text-muted)',
                  fontWeight: '500'
                }}>/month</span>
              </div>
              
              <div className="unit-price-details" style={{
                display: 'grid',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div className="price-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  borderRadius: '12px'
                }}>
                  <span className="price-label" style={{color: 'var(--text-primary)', fontWeight: '500'}}>Security Deposit:</span>
                  <span className="price-value" style={{color: 'var(--text-secondary)', fontWeight: '600'}}>
                    {formatCurrency(unit.depositAmount || unit.rentAmount)}
                  </span>
                </div>
                <div className="price-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  borderRadius: '12px'
                }}>
                  <span className="price-label" style={{color: 'var(--text-primary)', fontWeight: '500'}}>First Month's Rent:</span>
                  <span className="price-value" style={{color: 'var(--text-secondary)', fontWeight: '600'}}>{formatCurrency(unit.rentAmount)}</span>
                </div>
                <div className="price-item total" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'var(--primary-gradient)',
                  borderRadius: '12px',
                  color: 'white'
                }}>
                  <span className="price-label" style={{fontWeight: '600'}}>Move-in Cost:</span>
                  <span className="price-value" style={{fontWeight: '700'}}>
                    {formatCurrency((unit.depositAmount || unit.rentAmount) + unit.rentAmount)}
                  </span>
                </div>
              </div>

              {isAvailable ? (
                <button 
                  className="btn-premium btn-primary btn-apply"
                  onClick={handleApplyNow}
                  style={{
                    width: '100%',
                    padding: '1.25rem 2rem',
                    background: 'var(--primary-gradient)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = 'var(--shadow-glow)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'var(--shadow-md)';
                  }}
                >
                  🏠 Apply Now
                </button>
              ) : (
                <button 
                  className="btn-premium btn-secondary"
                  disabled
                  style={{
                    width: '100%',
                    padding: '1.25rem 2rem',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: 'var(--text-muted)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '16px',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    cursor: 'not-allowed'
                  }}
                >
                  Currently Unavailable
                </button>
              )}
            </div>

            <div className="unit-quick-info" style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {[
                {icon: '📅', text: 'Available Now'},
                {icon: '⏰', text: '24-48h Response Time'},
                {icon: '🔒', text: 'Secure Application'}
              ].map((item, index) => (
                <div key={index} className="info-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <span className="info-icon" style={{fontSize: '1.25rem'}}>{item.icon}</span>
                  <span className="info-text" style={{color: 'var(--text-primary)', fontWeight: '500'}}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Unit Specifications */}
        <div className="unit-specifications" style={{
          background: 'var(--bg-card)',
          padding: '3rem',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '3rem',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '2.5rem',
            textAlign: 'center',
            background: 'var(--gradient-hero)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Unit Specifications</h2>
          <div className="specs-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {icon: '🛏️', value: unit.bedrooms || 'N/A', label: 'Bedrooms'},
              {icon: '🚿', value: unit.bathrooms || 'N/A', label: 'Bathrooms'},
              {icon: '📏', value: unit.sqft || 'N/A', label: 'Square Feet'},
              {icon: '🏢', value: unit.unitNumber, label: 'Unit Number'}
            ].map((spec, index) => (
              <div key={index} className="spec-card" style={{
                background: 'rgba(102, 126, 234, 0.05)',
                padding: '2rem',
                borderRadius: '20px',
                textAlign: 'center',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
              }}
              >
                <div className="spec-icon" style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))'
                }}>{spec.icon}</div>
                <div className="spec-content">
                  <div className="spec-value" style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    color: 'var(--accent-teal)',
                    marginBottom: '0.5rem'
                  }}>{spec.value}</div>
                  <div className="spec-label" style={{
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>{spec.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features & Amenities */}
        <div className="unit-features-section" style={{
          background: 'var(--bg-card)',
          padding: '3rem',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '3rem',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '2.5rem',
            textAlign: 'center',
            background: 'var(--gradient-hero)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Features & Amenities</h2>
          <div className="features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              'Fully Furnished', 'Modern Kitchen', 'Air Conditioning', 'Heating System',
              'High-Speed Internet Ready', 'Cable TV Ready', 'Secure Access', 'Maintenance Support'
            ].map((feature, index) => (
              <div key={index} className="feature-item" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem',
                background: 'rgba(102, 126, 234, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                e.currentTarget.style.transform = 'translateX(8px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
              >
                <span className="feature-icon" style={{
                  fontSize: '1.5rem',
                  color: 'var(--accent-teal)'
                }}>✅</span>
                <span className="feature-text" style={{
                  color: 'var(--text-primary)',
                  fontWeight: '500',
                  fontSize: '1.1rem'
                }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Property Highlights */}
        {property && property.description && (
          <div className="property-highlights" style={{
            background: 'var(--bg-card)',
            padding: '3rem',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-lg)',
            marginBottom: '3rem',
            border: '1px solid rgba(102, 126, 234, 0.1)'
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
            }}>Property Highlights</h2>
            <p className="property-description" style={{
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              fontSize: '1.2rem'
            }}>
              {typeof property.description === 'string' 
                ? property.description 
                : 'This property offers excellent amenities and a great location.'}
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="unit-cta-section" style={{
          background: 'var(--gradient-card)',
          padding: '4rem 3rem',
          borderRadius: '24px',
          textAlign: 'center',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="cta-content" style={{position: 'relative', zIndex: '1'}}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
              background: 'var(--gradient-hero)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Ready to Make This Your New Home?</h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.3rem',
              marginBottom: '2.5rem',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>Join many satisfied tenants who found their perfect rental through our platform.</p>
            {isAvailable ? (
              <button 
                className="btn-premium btn-primary btn-large"
                onClick={handleApplyNow}
                style={{
                  padding: '1.5rem 3rem',
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  fontWeight: '700',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: 'var(--shadow-md)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = 'var(--shadow-glow)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                Start Your Application
              </button>
            ) : (
              <div className="waitlist-cta">
                <p style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '2rem',
                  fontSize: '1.2rem'
                }}>This unit is currently occupied. Would you like to join the waitlist?</p>
                <button className="btn-premium btn-secondary" style={{
                  padding: '1.25rem 2.5rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(102, 126, 234, 0.2)';
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                  e.target.style.transform = 'translateY(0)';
                }}
                >
                  Join Waitlist
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Application Confirmation Modal */}
      {showApplicationModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="modal-content" style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '2.5rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: 'var(--shadow-glow)',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>Confirm Application</h3>
              <button 
                className="modal-close"
                onClick={() => setShowApplicationModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '2rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                  e.target.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body" style={{marginBottom: '2rem'}}>
              <div className="application-summary" style={{
                background: 'rgba(102, 126, 234, 0.05)',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                marginBottom: '2rem'
              }}>
                <h4 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem'
                }}>Unit {unit.unitNumber}</h4>
                {property && <p style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '1.5rem'
                }}>{getPropertyName(property)}</p>}
                <div className="rent-summary" style={{
                  display: 'grid',
                  gap: '0.75rem'
                }}>
                  <div className="rent-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <span style={{color: 'var(--text-primary)', fontWeight: '500'}}>Monthly Rent:</span>
                    <span style={{color: 'var(--text-secondary)', fontWeight: '600'}}>{formatCurrency(unit.rentAmount)}</span>
                  </div>
                  <div className="rent-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <span style={{color: 'var(--text-primary)', fontWeight: '500'}}>Security Deposit:</span>
                    <span style={{color: 'var(--text-secondary)', fontWeight: '600'}}>{formatCurrency(unit.depositAmount || unit.rentAmount)}</span>
                  </div>
                  <div className="rent-item total" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'var(--primary-gradient)',
                    borderRadius: '8px',
                    color: 'white'
                  }}>
                    <span style={{fontWeight: '600'}}>Total Move-in Cost:</span>
                    <span style={{fontWeight: '700'}}>
                      {formatCurrency((unit.depositAmount || unit.rentAmount) + unit.rentAmount)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="application-notice" style={{
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <p style={{
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>📝 You'll need to provide:</p>
                <ul style={{
                  color: 'var(--text-secondary)',
                  paddingLeft: '1.5rem',
                  margin: 0
                }}>
                  <li>Personal information</li>
                  <li>Employment details</li>
                  <li>Income verification</li>
                  <li>Rental history</li>
                  <li>References</li>
                </ul>
              </div>
            </div>
            
            <div className="modal-footer" style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button 
                className="btn-premium btn-secondary"
                onClick={() => setShowApplicationModal(false)}
                style={{
                  padding: '1rem 2rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(102, 126, 234, 0.2)';
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-premium btn-primary"
                onClick={handleConfirmApplication}
                style={{
                  padding: '1rem 2rem',
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: 'var(--shadow-md)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = 'var(--shadow-glow)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                Continue to Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitDetail;
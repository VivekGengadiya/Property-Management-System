import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar.jsx';
import Footer from '../../components/common/Footer.jsx';
import { apiCall } from "../../services/api";

const LeasedProperties = () => {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeasedProperties();
  }, []);

 const fetchLeasedProperties = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to view your leased properties');
      setLoading(false);
      return;
    }

    const data = await apiCall(`/leases/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Leases API response:", data);

    if (data.success) {
      const activeLeases = data.data.filter(
        (lease) => lease.status === "ACTIVE"
      );
      setLeases(activeLeases);
    } else {
      setError(data.message || "Failed to load leased properties");
    }
  } catch (err) {
    console.error("Error fetching leased properties:", err);
    setError("Failed to load leased properties. Please try again later.");
  } finally {
    setLoading(false);
  }
};


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fix: Format address object to string
  const formatAddress = (address) => {
    if (!address) return 'Address not available';
    
    // If address is already a string, return it
    if (typeof address === 'string') return address;
    
    // If address is an object, format it properly
    if (typeof address === 'object') {
      const parts = [];
      if (address.line1) parts.push(address.line1);
      if (address.line2) parts.push(address.line2);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.postalCode) parts.push(address.postalCode);
      if (address.country) parts.push(address.country);
      
      return parts.length > 0 ? parts.join(', ') : 'Address not available';
    }
    
    return 'Address not available';
  };

  const getPropertyImage = (property) => {
    if (property?.images && property.images.length > 0) {
      if (property.images[0].startsWith('http')) {
        return property.images[0];
      }
      return `http://localhost:9000${property.images[0]}`;
    }
    return 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
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
            <p style={{color: 'var(--text-secondary)'}}>Loading your leased properties...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{background: 'var(--bg-primary)', minHeight: '100vh'}}>
      <Navbar />
      
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
            Dashboard
          </Link>
          <span style={{color: 'var(--text-muted)'}}>/</span>
          <span className="breadcrumb-current" style={{
            color: 'var(--text-primary)',
            fontWeight: '600'
          }}>My Leased Properties</span>
        </nav>

        {/* Page Header */}
        <div className="page-header" style={{
          textAlign: 'center',
          marginBottom: '3rem',
          padding: '3rem 0'
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
          }}>My Leased Properties</h1>
          <p className="page-subtitle" style={{
            fontSize: '1.3rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Manage your current rental properties and submit maintenance requests
          </p>
        </div>

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

        {/* Quick Actions Bar */}
        {leases.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '2rem'
          }}>
            <Link 
              to="/tenant/maintenance-tickets"
              className="btn-premium btn-secondary"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(139, 92, 246, 0.1)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)';
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              📋 View Maintenance Tickets
            </Link>
          </div>
        )}

        {/* Stats Overview */}
        {leases.length > 0 && (
          <div className="stats-grid-premium" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            <div className="stat-card-premium" style={{
              background: 'var(--bg-card)',
              padding: '2rem 1.5rem',
              borderRadius: '20px',
              textAlign: 'center',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div className="stat-icon-premium" style={{
                fontSize: '2.5rem', 
                marginBottom: '1rem',
                filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))'
              }}>🏠</div>
              <div className="stat-number-premium" style={{
                fontSize: '2rem',
                fontWeight: '800',
                background: 'var(--gradient-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>{leases.length}</div>
              <div className="stat-label-premium" style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Active Leases</div>
            </div>
            
            <div className="stat-card-premium" style={{
              background: 'var(--bg-card)',
              padding: '2rem 1.5rem',
              borderRadius: '20px',
              textAlign: 'center',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div className="stat-icon-premium" style={{
                fontSize: '2.5rem', 
                marginBottom: '1rem',
                filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))'
              }}>💰</div>
              <div className="stat-number-premium" style={{
                fontSize: '2rem',
                fontWeight: '800',
                background: 'var(--gradient-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>
                {formatCurrency(leases.reduce((total, lease) => total + (lease.rentAmount || lease.unitId?.rentAmount || 0), 0))}
              </div>
              <div className="stat-label-premium" style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Total Monthly Rent</div>
            </div>

            <div className="stat-card-premium" style={{
              background: 'var(--bg-card)',
              padding: '2rem 1.5rem',
              borderRadius: '20px',
              textAlign: 'center',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div className="stat-icon-premium" style={{
                fontSize: '2.5rem', 
                marginBottom: '1rem',
                filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))'
              }}>🔧</div>
              <div className="stat-number-premium" style={{
                fontSize: '2rem',
                fontWeight: '800',
                background: 'var(--gradient-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>
                {leases.length}
              </div>
              <div className="stat-label-premium" style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Properties</div>
            </div>
          </div>
        )}

        {/* Leased Properties Grid */}
        <div className="leases-section">
          {leases.length === 0 ? (
            <div className="empty-state" style={{
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
              }}>🏠</div>
              <h3 style={{
                color: 'var(--text-primary)', 
                marginBottom: '1rem',
                fontSize: '1.75rem',
                fontWeight: '700'
              }}>No Active Leases</h3>
              <p style={{
                color: 'var(--text-secondary)', 
                marginBottom: '2.5rem',
                fontSize: '1.1rem'
              }}>
                {error ? error : "You don't have any active lease agreements at the moment."}
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
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-glow)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }}>
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="leases-grid" style={{
              display: 'grid',
              gap: '2rem'
            }}>
              {leases.map((lease) => (
                <div key={lease._id} className="lease-card" style={{
                  background: 'var(--bg-card)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '300px 1fr',
                    gap: '0'
                  }}>
                    {/* Property Image */}
                    <div style={{
                      position: 'relative',
                      overflow: 'hidden',
                      height: '250px'
                    }}>
                      <img 
                        src={getPropertyImage(lease.unitId?.propertyId)} 
                        alt={lease.unitId?.propertyId?.name || 'Property'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        background: 'var(--accent-green)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        boxShadow: 'var(--shadow-md)'
                      }}>
                        Active Lease
                      </div>
                    </div>

                    {/* Lease Details */}
                    <div style={{ padding: '2rem' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1.5rem'
                      }}>
                        <div>
                          <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem'
                          }}>
                            {lease.unitId?.propertyId?.name || 'Property Name'}
                          </h3>
                          <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1.1rem',
                            marginBottom: '0.25rem'
                          }}>
                            Unit {lease.unitId?.unitNumber || 'N/A'}
                          </p>
                          {/* FIXED: Use formatAddress function to render address properly */}
                          <p style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem'
                          }}>
                            {formatAddress(lease.unitId?.propertyId?.address)}
                          </p>
                        </div>
                        <div style={{
                          textAlign: 'right'
                        }}>
                          <div style={{
                            fontSize: '1.75rem',
                            fontWeight: '800',
                            color: 'var(--accent-green)',
                            marginBottom: '0.5rem'
                          }}>
                            {formatCurrency(lease.rentAmount || lease.unitId?.rentAmount)}
                            <span style={{
                              fontSize: '1rem', 
                              color: 'var(--text-muted)',
                              fontWeight: '500'
                            }}>/month</span>
                          </div>
                          <div style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem'
                          }}>
                            Lease Active
                          </div>
                        </div>
                      </div>

                      {/* Lease Information */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1rem',
                        marginBottom: '2rem',
                        padding: '1.5rem',
                        background: 'rgba(102, 126, 234, 0.05)',
                        borderRadius: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.1)'
                      }}>
                        <div>
                          <div style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem',
                            marginBottom: '0.25rem',
                            fontWeight: '500'
                          }}>Lease Start</div>
                          <div style={{
                            color: 'var(--text-primary)',
                            fontWeight: '600'
                          }}>{formatDate(lease.startDate)}</div>
                        </div>
                        <div>
                          <div style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem',
                            marginBottom: '0.25rem',
                            fontWeight: '500'
                          }}>Lease End</div>
                          <div style={{
                            color: 'var(--text-primary)',
                            fontWeight: '600'
                          }}>{formatDate(lease.endDate)}</div>
                        </div>
                        <div>
                          <div style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem',
                            marginBottom: '0.25rem',
                            fontWeight: '500'
                          }}>Security Deposit</div>
                          <div style={{
                            color: 'var(--text-primary)',
                            fontWeight: '600'
                          }}>{formatCurrency(lease.depositAmount || lease.unitId?.depositAmount)}</div>
                        </div>
                        <div>
                          <div style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem',
                            marginBottom: '0.25rem',
                            fontWeight: '500'
                          }}>Unit Type</div>
                          <div style={{
                            color: 'var(--text-primary)',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {lease.unitId?.bedrooms || 'N/A'} Bed, {lease.unitId?.bathrooms || 'N/A'} Bath
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end'
                      }}>
                        <Link 
                          to={`/maintenance/create?unitId=${lease.unitId?._id}`}
                          className="btn-premium btn-primary"
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: 'var(--primary-gradient)',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease',
                            boxShadow: 'var(--shadow-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
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
                          🛠️ Request Maintenance
                        </Link>
                        
                        <Link 
                          to={`/unit/${lease.unitId?._id}`}
                          className="btn-premium btn-secondary"
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(102, 126, 234, 0.1)',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease'
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
                          View Unit Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LeasedProperties;
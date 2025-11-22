import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar.jsx';
import Footer from '../../components/common/Footer.jsx';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = [
    { key: 'ALL', label: 'All Applications', icon: '📋', count: 0 },
    { key: 'PENDING', label: 'Under Review', icon: '⏳', count: 0 },
    { key: 'APPROVED', label: 'Approved', icon: '✅', count: 0 },
    { key: 'REJECTED', label: 'Not Selected', icon: '❌', count: 0 },
    { key: 'WITHDRAWN', label: 'Withdrawn', icon: '↩️', count: 0 }
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    // Update filter counts whenever applications change
    const updatedFilters = filters.map(filter => ({
      ...filter,
      count: getFilterCount(filter.key)
    }));
    
    // Apply active filter
    applyFilter(activeFilter);
  }, [applications]);

  const getFilterCount = (filterKey) => {
    if (filterKey === 'ALL') return applications.length;
    if (filterKey === 'WITHDRAWN') {
      return applications.filter(app => app.withdrawn).length;
    }
    return applications.filter(app => app.status === filterKey && !app.withdrawn).length;
  };

  const applyFilter = (filterKey) => {
    setActiveFilter(filterKey);
    
    if (filterKey === 'ALL') {
      setFilteredApplications(applications);
    } else if (filterKey === 'WITHDRAWN') {
      setFilteredApplications(applications.filter(app => app.withdrawn));
    } else {
      setFilteredApplications(applications.filter(app => 
        app.status === filterKey && !app.withdrawn
      ));
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your applications');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:9000/api/applications/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
        throw new Error(`Failed to fetch applications: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const apps = data.data || [];
        setApplications(apps);
        setFilteredApplications(apps); // Initially show all
      } else {
        setError(data.message || 'Failed to load applications');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again later.');
      setLoading(false);
    }
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:9000/api/applications/my/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw application');
      }

      const data = await response.json();
      if (data.success) {
        // Update the local state to reflect the withdrawal
        setApplications(prev => prev.map(app => 
          app._id === applicationId 
            ? { ...app, status: 'REJECTED', withdrawn: true }
            : app
        ));
      } else {
        throw new Error(data.message || 'Failed to withdraw application');
      }
    } catch (err) {
      console.error('Error withdrawing application:', err);
      alert('Failed to withdraw application. Please try again.');
    }
  };

  const getStatusBadge = (status, withdrawn = false) => {
    if (withdrawn) {
      return (
        <span style={{
          background: 'rgba(100, 116, 139, 0.1)',
          color: 'var(--text-muted)',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '600',
          border: '1px solid rgba(100, 116, 139, 0.2)'
        }}>
          Withdrawn
        </span>
      );
    }

    const statusConfig = {
      'PENDING': { color: 'var(--accent-orange)', bg: 'rgba(245, 158, 11, 0.1)', label: 'Under Review' },
      'APPROVED': { color: 'var(--accent-green)', bg: 'rgba(16, 185, 129, 0.1)', label: 'Approved' },
      'REJECTED': { color: 'var(--accent-red)', bg: 'rgba(239, 68, 68, 0.1)', label: 'Not Selected' }
    };

    const config = statusConfig[status] || statusConfig['PENDING'];
    
    return (
      <span style={{
        background: config.bg,
        color: config.color,
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        border: `1px solid ${config.color}20`
      }}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getApplicationIcon = (status, withdrawn = false) => {
    if (withdrawn) return '↩️';
    
    const icons = {
      'PENDING': '⏳',
      'APPROVED': '✅',
      'REJECTED': '❌'
    };
    return icons[status] || '📄';
  };

  const getPropertyAddress = (property) => {
    if (!property) return 'Address not available';
    
    if (typeof property.address === 'object' && property.address !== null) {
      const addressParts = [];
      if (property.address.street) addressParts.push(property.address.street);
      if (property.address.city) addressParts.push(property.address.city);
      if (property.address.state) addressParts.push(property.address.state);
      return addressParts.length > 0 ? addressParts.join(', ') : 'Address not specified';
    }
    
    return property.address || 'Address not available';
  };

  // Check if current user is landlord
  const isLandlord = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'LANDLORD' || user.role === 'OWNER';
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
            <p style={{color: 'var(--text-secondary)'}}>Loading your applications...</p>
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
          <Link to={isLandlord() ? "/landlord/dashboard" : "/tenant/dashboard"} className="breadcrumb-link" style={{
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
          }}>My Applications</span>
        </nav>

        {/* Page Header */}
        <div className="page-header" style={{
          textAlign: 'center',
          marginBottom: '2rem',
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
          }}>My Applications</h1>
          <p className="page-subtitle" style={{
            fontSize: '1.3rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            {isLandlord() ? 'Manage tenant applications for your properties' : 'Track and manage all your rental applications in one place'}
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

        {/* Filter Navigation - Now inside the main card */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '2rem'
        }}>
          {/* Card Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '24px 32px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              📋 Application Filters
            </h2>
          </div>

          {/* Filter Content */}
          <div style={{ padding: '24px 32px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                color: 'var(--text-secondary)',
                fontSize: '14px'
              }}>
                Showing {filteredApplications.length} of {applications.length} applications
              </div>
            </div>
            
            <div className="filter-buttons" style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => applyFilter(filter.key)}
                  className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    background: activeFilter === filter.key ? 'var(--primary-gradient)' : 'rgba(102, 126, 234, 0.05)',
                    color: activeFilter === filter.key ? 'white' : 'var(--text-primary)',
                    border: `1px solid ${activeFilter === filter.key ? 'transparent' : 'rgba(102, 126, 234, 0.2)'}`,
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (activeFilter !== filter.key) {
                      e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeFilter !== filter.key) {
                      e.target.style.background = 'rgba(102, 126, 234, 0.05)';
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                    }
                  }}
                >
                  <span style={{fontSize: '16px'}}>{filter.icon}</span>
                  {filter.label}
                  {getFilterCount(filter.key) > 0 && (
                    <span style={{
                      background: activeFilter === filter.key ? 'rgba(255, 255, 255, 0.2)' : 'rgba(102, 126, 234, 0.1)',
                      color: activeFilter === filter.key ? 'white' : 'var(--primary-light)',
                      padding: '4px 8px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '700',
                      minWidth: '20px'
                    }}>
                      {getFilterCount(filter.key)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="applications-section">
          {filteredApplications.length === 0 ? (
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
              }}>
                {activeFilter === 'ALL' ? '📝' : 
                 activeFilter === 'PENDING' ? '⏳' :
                 activeFilter === 'APPROVED' ? '✅' :
                 activeFilter === 'REJECTED' ? '❌' : '↩️'}
              </div>
              <h3 style={{
                color: 'var(--text-primary)', 
                marginBottom: '1rem',
                fontSize: '1.75rem',
                fontWeight: '700'
              }}>
                {activeFilter === 'ALL' ? 'No Applications Yet' :
                 activeFilter === 'PENDING' ? 'No Pending Applications' :
                 activeFilter === 'APPROVED' ? 'No Approved Applications' :
                 activeFilter === 'REJECTED' ? 'No Rejected Applications' : 'No Withdrawn Applications'}
              </h3>
              <p style={{
                color: 'var(--text-secondary)', 
                marginBottom: '2.5rem',
                fontSize: '1.1rem'
              }}>
                {activeFilter === 'ALL' ? "You haven't submitted any rental applications yet." :
                 `You don't have any ${activeFilter.toLowerCase().replace('_', ' ')} applications at the moment.`}
              </p>
              {activeFilter !== 'ALL' && applications.length > 0 ? (
                <button 
                  onClick={() => applyFilter('ALL')}
                  className="btn-premium btn-secondary"
                  style={{
                    padding: '1rem 2rem',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    marginRight: '1rem'
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
                  View All Applications
                </button>
              ) : null}
              {applications.length === 0 && (
                <Link to={isLandlord() ? "/landlord/dashboard" : "/tenant/dashboard"} className="btn-premium btn-primary" style={{
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
                  {isLandlord() ? 'Back to Dashboard' : 'Browse Properties'}
                </Link>
              )}
            </div>
          ) : (
            <div className="applications-grid" style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              {filteredApplications.map((application) => (
                <div key={application._id} className="application-card" style={{
                  background: 'var(--bg-card)',
                  padding: '2.5rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
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
                  <div className="application-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1.5rem'
                  }}>
                    <div className="application-info">
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '0.75rem'
                      }}>
                        <span className="application-icon" style={{
                          fontSize: '2.5rem'
                        }}>
                          {getApplicationIcon(application.status, application.withdrawn)}
                        </span>
                        <div>
                          <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            marginBottom: '0.25rem'
                          }}>
                            {application.unitId?.unitNumber ? `Unit ${application.unitId.unitNumber}` : 'Unit Information'}
                          </h3>
                          <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1.1rem',
                            marginBottom: '0.25rem'
                          }}>
                            {application.unitId?.propertyId?.name || 'Property Information'}
                          </p>
                          <p style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem'
                          }}>
                            {getPropertyAddress(application.unitId?.propertyId)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="application-status">
                      {getStatusBadge(application.status, application.withdrawn)}
                    </div>
                  </div>

                  <div className="application-details" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                  }}>
                    <div className="detail-item" style={{
                      padding: '1rem',
                      background: 'rgba(102, 126, 234, 0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      <div style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem',
                        fontWeight: '500'
                      }}>Applied On</div>
                      <div style={{
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        fontSize: '1.1rem'
                      }}>{formatDate(application.createdAt)}</div>
                    </div>

                    <div className="detail-item" style={{
                      padding: '1rem',
                      background: 'rgba(102, 126, 234, 0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      <div style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem',
                        fontWeight: '500'
                      }}>Monthly Rent</div>
                      <div style={{
                        color: 'var(--accent-green)',
                        fontWeight: '700',
                        fontSize: '1.1rem'
                      }}>
                        ${application.unitId?.rentAmount || 'N/A'}
                      </div>
                    </div>

                    <div className="detail-item" style={{
                      padding: '1rem',
                      background: 'rgba(102, 126, 234, 0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      <div style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem',
                        fontWeight: '500'
                      }}>Documents</div>
                      <div style={{
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        fontSize: '1.1rem'
                      }}>
                        {application.docs?.length || 0} files
                      </div>
                    </div>

                    <div className="detail-item" style={{
                      padding: '1rem',
                      background: 'rgba(102, 126, 234, 0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      <div style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem',
                        fontWeight: '500'
                      }}>Unit Status</div>
                      <div style={{
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        textTransform: 'capitalize'
                      }}>
                        {application.unitId?.status?.toLowerCase() || 'Unknown'}
                      </div>
                    </div>
                  </div>

                  {application.note && (
                    <div className="application-notes" style={{
                      background: 'rgba(245, 158, 11, 0.05)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(245, 158, 11, 0.1)',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>📝 Your Note</div>
                      <p style={{
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: '1.6'
                      }}>{application.note}</p>
                    </div>
                  )}

                  {application.rejectionReason && (
                    <div className="rejection-reason" style={{
                      background: 'rgba(239, 68, 68, 0.05)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(239, 68, 68, 0.1)',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>❌ Reason for Rejection</div>
                      <p style={{
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: '1.6'
                      }}>{application.rejectionReason}</p>
                    </div>
                  )}

                  <div className="application-actions" style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end'
                  }}>
                    {application.unitId && (
                      <Link 
                        to={`/unit/${application.unitId._id}`}
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
                        View Unit
                      </Link>
                    )}
                    
                    {/* CREATE LEASE BUTTON - Only show for landlords on approved applications */}
                    {isLandlord() && application.status === 'APPROVED' && (
                      <Link 
                        to="/lease/signing"
                        state={{ 
                          applicationId: application._id,
                          unitId: application.unitId?._id,
                          propertyId: application.unitId?.propertyId?._id,
                          tenantId: application.tenantId?._id
                        }}
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
                        📝 Create Lease
                      </Link>
                    )}
                    
                    {/* SIGN LEASE BUTTON - Only show for tenants on approved applications */}
                    {!isLandlord() && application.status === 'APPROVED' && !application.withdrawn && (
                      <Link 
                        to="/lease/preview"
                        state={{ 
                          applicationId: application._id,
                          unitId: application.unitId?._id,
                          propertyId: application.unitId?.propertyId?._id
                        }}
                        className="btn-premium btn-primary"
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: 'var(--accent-green)',
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
                        📝 Sign Lease
                      </Link>
                    )}
                    
                    {!isLandlord() && application.status === 'PENDING' && !application.withdrawn && (
                      <button 
                        onClick={() => handleWithdrawApplication(application._id)}
                        className="btn-premium btn-warning"
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: 'rgba(245, 158, 11, 0.1)',
                          color: 'var(--text-primary)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(245, 158, 11, 0.2)';
                          e.target.style.borderColor = 'rgba(245, 158, 11, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(245, 158, 11, 0.1)';
                          e.target.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                        }}
                      >
                        Withdraw Application
                      </button>
                    )}
                  </div>

                  {/* Last updated timestamp */}
                  <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '2.5rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem'
                  }}>
                    Updated {formatDate(application.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Status Guide */}
        {applications.length > 0 && (
          <div className="status-guide" style={{
            background: 'var(--bg-card)',
            padding: '2.5rem',
            borderRadius: '20px',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            marginTop: '3rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>Application Status Guide</h3>
            <div className="status-list" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              {[
                { status: 'PENDING', description: 'Your application is under review by the property manager' },
                { status: 'APPROVED', description: 'Congratulations! Your application has been approved' },
                { status: 'REJECTED', description: 'Your application was not selected for this unit' },
                { status: 'WITHDRAWN', description: 'You have withdrawn your application' }
              ].map((item, index) => (
                <div key={index} className="status-item" style={{
                  textAlign: 'center',
                  padding: '1.5rem'
                }}>
                  <div style={{marginBottom: '1rem'}}>
                    {getStatusBadge(item.status, item.status === 'WITHDRAWN')}
                  </div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    margin: 0
                  }}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Applications;
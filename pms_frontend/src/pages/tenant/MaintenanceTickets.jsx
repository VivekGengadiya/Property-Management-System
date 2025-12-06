import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar.jsx';
import Footer from '../../components/common/Footer.jsx';
import { apiCall } from "../../services/api.js";

const MaintenanceTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your maintenance tickets');
        setLoading(false);
        return;
      }

      const response = await apiCall(`/maintenance/my`, {
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
        throw new Error(`Failed to fetch tickets: ${response.status}`);
      }

      const data = await response.json();
      console.log('Tickets API response:', data);
      
      if (data.success) {
        setTickets(data.data || []);
      } else {
        setError(data.message || 'Failed to load maintenance tickets');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching maintenance tickets:', err);
      setError('Failed to load maintenance tickets. Please try again later.');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Open' };
      case 'IN_PROGRESS':
        return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', label: 'In Progress' };
      case 'ON_HOLD':
        return { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', label: 'On Hold' };
      case 'RESOLVED':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Resolved' };
      case 'CLOSED':
        return { color: '#1f2937', bg: 'rgba(31, 41, 55, 0.1)', label: 'Closed' };
      default:
        return { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', label: status };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return { color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)', label: 'Urgent' };
      case 'HIGH':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'High' };
      case 'MEDIUM':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Medium' };
      case 'LOW':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Low' };
      default:
        return { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', label: priority };
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'PLUMBING':
        return '🚰';
      case 'ELECTRICAL':
        return '💡';
      case 'HVAC':
        return '❄️';
      case 'APPLIANCE':
        return '🔌';
      case 'GENERAL':
      default:
        return '🔧';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
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
            <p style={{color: 'var(--text-secondary)'}}>Loading your maintenance tickets...</p>
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
          }}>My Maintenance Tickets</span>
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
          }}>My Maintenance Tickets</h1>
          <p className="page-subtitle" style={{
            fontSize: '1.3rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Track and manage all your maintenance requests in one place
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

        {/* Stats Overview */}
        {tickets.length > 0 && (
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
              }}>📋</div>
              <div className="stat-number-premium" style={{
                fontSize: '2rem',
                fontWeight: '800',
                background: 'var(--gradient-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>{tickets.length}</div>
              <div className="stat-label-premium" style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Total Tickets</div>
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
              }}>⏳</div>
              <div className="stat-number-premium" style={{
                fontSize: '2rem',
                fontWeight: '800',
                background: 'var(--gradient-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>
                {tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length}
              </div>
              <div className="stat-label-premium" style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Active Tickets</div>
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
              }}>✅</div>
              <div className="stat-number-premium" style={{
                fontSize: '2rem',
                fontWeight: '800',
                background: 'var(--gradient-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>
                {tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length}
              </div>
              <div className="stat-label-premium" style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Completed</div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            All Maintenance Requests
          </h2>
          <Link 
            to="/maintenance/create"
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
            🛠️ New Request
          </Link>
        </div>

        {/* Tickets List */}
        <div className="tickets-section">
          {tickets.length === 0 ? (
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
              }}>📋</div>
              <h3 style={{
                color: 'var(--text-primary)', 
                marginBottom: '1rem',
                fontSize: '1.75rem',
                fontWeight: '700'
              }}>No Maintenance Tickets</h3>
              <p style={{
                color: 'var(--text-secondary)', 
                marginBottom: '2.5rem',
                fontSize: '1.1rem'
              }}>
                You haven't submitted any maintenance requests yet.
              </p>
              <Link to="/maintenance/create" className="btn-premium btn-primary" style={{
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
                Create Your First Ticket
              </Link>
            </div>
          ) : (
            <div className="tickets-grid" style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              {tickets.map((ticket) => (
                <div key={ticket._id} className="ticket-card" style={{
                  background: 'var(--bg-card)',
                  borderRadius: '16px',
                  padding: '2rem',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '0.75rem'
                      }}>
                        <span style={{fontSize: '1.5rem'}}>
                          {getCategoryIcon(ticket.category)}
                        </span>
                        <h3 style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: 'var(--text-primary)',
                          margin: 0
                        }}>
                          {ticket.title}
                        </h3>
                      </div>
                      <p style={{
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: '1.5'
                      }}>
                        {ticket.description}
                      </p>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      alignItems: 'flex-end'
                    }}>
                      <div style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        ...getStatusColor(ticket.status)
                      }}>
                        {getStatusColor(ticket.status).label}
                      </div>
                      <div style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        ...getPriorityColor(ticket.priority)
                      }}>
                        {getPriorityColor(ticket.priority).label}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
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
                      }}>Unit</div>
                      <div style={{
                        color: 'var(--text-primary)',
                        fontWeight: '600'
                      }}>
                        {ticket.unitId?.unitNumber ? `Unit ${ticket.unitId.unitNumber}` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        marginBottom: '0.25rem',
                        fontWeight: '500'
                      }}>Category</div>
                      <div style={{
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {ticket.category?.toLowerCase()}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        marginBottom: '0.25rem',
                        fontWeight: '500'
                      }}>Submitted</div>
                      <div style={{
                        color: 'var(--text-primary)',
                        fontWeight: '600'
                      }}>
                        {getTimeAgo(ticket.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        marginBottom: '0.25rem',
                        fontWeight: '500'
                      }}>Assigned To</div>
                      <div style={{
                        color: 'var(--text-primary)',
                        fontWeight: '600'
                      }}>
                        {ticket.assignedTo?.name || 'Not assigned'}
                      </div>
                    </div>
                  </div>

                  {/* Timeline Preview */}
                  {ticket.timeline && ticket.timeline.length > 0 && (
                    <div style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      <div style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        marginBottom: '0.5rem'
                      }}>Latest Update:</div>
                      <div style={{
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontStyle: 'italic'
                      }}>
                        {ticket.timeline[ticket.timeline.length - 1]?.note || 'No updates yet'}
                      </div>
                    </div>
                  )}
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

export default MaintenanceTickets;
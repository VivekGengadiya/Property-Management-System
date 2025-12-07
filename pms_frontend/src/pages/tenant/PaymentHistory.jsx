import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Navbar.jsx';
import Footer from '../../components/common/Footer.jsx';
import { apiCall } from "../../services/api.js";

// Token validation functions
const isValidToken = (token) => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    return !isExpired;
  } catch (error) {
    return false;
  }
};

const refreshAuthToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    const data = await apiCall("/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (data.success && data.accessToken) {
      localStorage.setItem("token", data.accessToken);
      return data.accessToken;
    }

    throw new Error(data.message || "Token refresh failed");

  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
};


const getValidToken = async () => {
  let token = localStorage.getItem('token');
  if (!token || !isValidToken(token)) {
    token = await refreshAuthToken();
  }
  return token;
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

 const fetchPayments = async () => {
  try {
    const token = await getValidToken();

    const data = await apiCall("/payments/my", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (data.success) {
      setPayments(data.data || []);
    } else {
      setError(data.message || "Failed to load payments");
    }

  } catch (error) {
    console.error("Error fetching payments:", error);
    setError("Failed to load payment history. Please try again.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPayments();
  }, []);

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'SUCCEEDED': { background: '#dcfce7', color: '#166534', label: 'Paid' },
      'COMPLETED': { background: '#dcfce7', color: '#166534', label: 'Completed' },
      'PENDING': { background: '#fef3c7', color: '#92400e', label: 'Pending' },
      'FAILED': { background: '#fee2e2', color: '#dc2626', label: 'Failed' },
      'REFUNDED': { background: '#dbeafe', color: '#1e40af', label: 'Refunded' }
    };
    
    const config = statusConfig[status] || { background: '#f3f4f6', color: '#374151', label: status };
    
    return (
      <span style={{
        backgroundColor: config.background,
        color: config.color,
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <Header />
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>Loading payment history...</p>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      <Header />
      
      {/* Main Content */}
      <div style={{
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px',
          padding: '40px 0'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '16px'
          }}>
            Payment History
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            View all your payment transactions and receipts in one place
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: '#dc2626'
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span style={{ fontWeight: '500' }}>{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {payments.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '48px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px'
              }}>
                {payments.length}
              </div>
              <div style={{
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Total Payments
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px'
              }}>
                {payments.filter(p => p.status === 'SUCCEEDED' || p.status === 'COMPLETED').length}
              </div>
              <div style={{
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Successful
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px'
              }}>
                ${payments.reduce((total, p) => total + (p.amount || 0), 0).toLocaleString()}
              </div>
              <div style={{
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Total Amount
              </div>
            </div>
          </div>
        )}

        {/* Payments Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Card Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '32px'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: 0
            }}>
              Your Payments
            </h2>
          </div>

          {/* Card Content */}
          <div style={{ padding: '32px' }}>
            {payments.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px'
              }}>
                <div style={{
                  fontSize: '80px',
                  marginBottom: '24px',
                  filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))'
                }}>💳</div>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '12px'
                }}>
                  No Payments Yet
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '18px',
                  marginBottom: '32px',
                  maxWidth: '400px',
                  margin: '0 auto 32px',
                  lineHeight: '1.6'
                }}>
                  Your payment history will appear here once you make payments through the system.
                </p>
                <button
                  onClick={() => navigate('/tenant/leases')}
                  style={{
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 15px -3px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  View Available Leases
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {payments.map((payment) => (
                  <div 
                    key={payment._id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '16px',
                      padding: '24px',
                      backgroundColor: '#fafafa',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.backgroundColor = '#fafafa';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      {/* Payment Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          flexWrap: 'wrap'
                        }}>
                          <h4 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: 0
                          }}>
                            {formatCurrency(payment.amount)}
                          </h4>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div style={{
                          textAlign: 'right'
                        }}>
                          <div style={{
                            color: '#6b7280',
                            fontSize: '14px',
                            marginBottom: '8px'
                          }}>
                            ID: {payment._id?.slice(-8) || 'N/A'}
                          </div>
                          {/* <button
                            onClick={() => window.print()}
                            style={{
                              color: '#667eea',
                              background: 'none',
                              border: '1px solid #667eea',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#667eea';
                              e.target.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#667eea';
                            }}
                          >
                            Print Receipt
                          </button> */}
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        padding: '16px',
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                        borderRadius: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.1)'
                      }}>
                        <div>
                          <strong style={{ color: '#374151' }}>Method:</strong>{' '}
                          <span style={{ color: '#6b7280' }}>{payment.method || 'PayPal'}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#374151' }}>Date:</strong>{' '}
                          <span style={{ color: '#6b7280' }}>{formatDate(payment.paidAt || payment.createdAt)}</span>
                        </div>
                        {payment.invoiceId?.leaseId?.unitId && (
                          <div>
                            <strong style={{ color: '#374151' }}>Unit:</strong>{' '}
                            <span style={{ color: '#6b7280' }}>{payment.invoiceId.leaseId.unitId.unitNumber}</span>
                          </div>
                        )}
                        {payment.paypalOrderId && (
                          <div>
                            <strong style={{ color: '#374151' }}>Transaction ID:</strong>{' '}
                            <span style={{
                              fontFamily: 'monospace',
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#667eea'
                            }}>
                              {payment.paypalOrderId.slice(-8)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

export default PaymentHistory;
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from '../../components/common/Navbar.jsx';
import Footer from '../../components/common/Footer.jsx';

const TenantLeasePreview = () => {
  const { leaseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [leaseData, setLeaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [unitDetails, setUnitDetails] = useState(null);
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [error, setError] = useState('');

  // Fetch lease data from backend
  const fetchLeaseData = async () => {
    try {
      console.log("Starting to fetch lease data...");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view lease");
        setLoading(false);
        navigate("/login");
        return;
      }

      // If we have a specific leaseId, fetch that lease directly
      if (leaseId) {
        console.log("Fetching specific lease:", leaseId);
        const response = await fetch(`http://localhost:9000/api/leases/${leaseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch lease: ${response.status}`);
        }

        const result = await response.json();
        console.log("Lease API response:", result);

        if (result.success && result.data) {
          setLeaseData(result.data);
          await fetchUnitAndPropertyDetails(result.data.unitId);
        } else {
          throw new Error(result.message || "Failed to load lease data");
        }
      } else {
        // If no leaseId, fetch all user leases and find the relevant one
        console.log("Fetching all user leases...");
        const response = await fetch("http://localhost:9000/api/leases/my", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch leases");
        }

        const result = await response.json();
        console.log("All leases API response:", result);

        if (result.success && result.data) {
          // Try to find lease by applicationId from location state
          const applicationId = location.state?.applicationId;
          let targetLease;

          if (applicationId) {
            // Look for lease with matching applicationId
            targetLease = result.data.find((lease) => lease.applicationId === applicationId);
          }

          // If no lease found by applicationId, take the first pending lease
          if (!targetLease) {
            targetLease = result.data.find((lease) => lease.status === "PENDING") || result.data[0];
          }

          if (targetLease) {
            console.log("Found lease:", targetLease);
            setLeaseData(targetLease);
            await fetchUnitAndPropertyDetails(targetLease.unitId);
          } else {
            throw new Error("No lease found for your account");
          }
        } else {
          throw new Error(result.message || "Failed to load lease data");
        }
      }
    } catch (error) {
      console.error("Error fetching lease data:", error);
      setError(error.message || "Failed to load lease agreement");
    } finally {
      setLoading(false);
    }
  };

  // Fetch unit and property details
  const fetchUnitAndPropertyDetails = async (unitId) => {
    if (!unitId) {
      console.log("No unitId provided");
      return;
    }

    try {
      console.log("Fetching unit details for:", unitId);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:9000/api/units/${unitId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Unit API response:", result);
        if (result.success) {
          setUnitDetails(result.data);

          // Fetch property details if available
          if (result.data.propertyId) {
            await fetchPropertyDetails(result.data.propertyId);
          }
        }
      } else {
        console.log("Failed to fetch unit details");
      }
    } catch (error) {
      console.error("Error fetching unit details:", error);
    }
  };

  // Fetch property details
  const fetchPropertyDetails = async (propertyId) => {
    try {
      console.log("Fetching property details for:", propertyId);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:9000/api/properties/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Property API response:", result);
        if (result.success) {
          setPropertyDetails(result.data);
        }
      } else {
        console.log("Failed to fetch property details");
      }
    } catch (error) {
      console.error("Error fetching property details:", error);
    }
  };

  useEffect(() => {
    console.log("LeasePreview mounted with:", { leaseId, locationState: location.state });
    fetchLeaseData();
  }, [leaseId, location.state]);

  // Handle lease acceptance
  const handleAcceptLease = async () => {
    if (!leaseData) return;
    
    setSigning(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:9000/api/leases/${leaseData._id}/respond`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: "ACCEPT" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to accept lease");
      }

      if (result.success) {
        alert("Lease accepted successfully!");
        // Update local state
        setLeaseData((prev) => ({
          ...prev,
          status: "ACTIVE",
        }));
      } else {
        throw new Error(result.message || "Lease acceptance failed");
      }
    } catch (error) {
      console.error("Error accepting lease:", error);
      alert(error.message || "Failed to accept lease");
    } finally {
      setSigning(false);
    }
  };

  // Handle lease rejection
  const handleRejectLease = async () => {
    if (!leaseData) return;
    
    if (!window.confirm("Are you sure you want to reject this lease agreement? This action cannot be undone.")) {
      return;
    }

    setSigning(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:9000/api/leases/${leaseData._id}/respond`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: "REJECT" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to reject lease");
      }

      if (result.success) {
        alert("Lease rejected");
        navigate("/tenant/dashboard");
      } else {
        throw new Error(result.message || "Lease rejection failed");
      }
    } catch (error) {
      console.error("Error rejecting lease:", error);
      alert(error.message || "Failed to reject lease");
    } finally {
      setSigning(false);
    }
  };

  // Handle payment
  const handleMakePayment = async () => {
    try {
      // Navigate to payment page with lease details
      navigate('/payment', {
        state: {
          leaseId: leaseData._id,
          amount: leaseData.rentAmount,
          depositAmount: leaseData.depositAmount,
          type: 'RENT_PAYMENT'
        }
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error navigating to payment page');
    }
  };

  // Handle PDF download
  const handleDownloadLease = async () => {
    try {
      alert("PDF download feature coming soon");
      console.log("Downloading lease PDF for:", leaseData?._id);
    } catch (error) {
      console.error("Error downloading lease:", error);
      alert("Failed to download lease");
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Get property address
  const getPropertyAddress = () => {
    if (!propertyDetails) return "Address not available";

    if (propertyDetails.address) {
      if (typeof propertyDetails.address === "object") {
        const { street, city, state, zipCode } = propertyDetails.address;
        return [street, city, state, zipCode].filter(Boolean).join(", ");
      }
      return propertyDetails.address;
    }

    return "Address not available";
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { color: 'var(--accent-orange)', bg: 'rgba(245, 158, 11, 0.1)', label: 'Pending Signature' },
      'ACTIVE': { color: 'var(--accent-green)', bg: 'rgba(16, 185, 129, 0.1)', label: 'Active' },
      'REJECTED': { color: 'var(--accent-red)', bg: 'rgba(239, 68, 68, 0.1)', label: 'Rejected' },
      'TERMINATED': { color: 'var(--text-muted)', bg: 'rgba(100, 116, 139, 0.1)', label: 'Terminated' }
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
            <p style={{color: 'var(--text-secondary)'}}>Loading your lease agreement...</p>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem'}}>
              Lease ID: {leaseId || 'Not specified'}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container" style={{background: 'var(--bg-primary)', minHeight: '100vh'}}>
        <Navbar />
        <div className="premium-container">
          <div className="error-state" style={{
            textAlign: 'center', 
            padding: '5rem 2rem',
            background: 'var(--bg-card)',
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            marginTop: '2rem'
          }}>
            <div style={{
              fontSize: '5rem', 
              marginBottom: '1.5rem',
              filter: 'drop-shadow(0 4px 12px rgba(239, 68, 68, 0.3))'
            }}>⚠️</div>
            <h3 style={{
              color: 'var(--text-primary)', 
              marginBottom: '1rem',
              fontSize: '1.75rem',
              fontWeight: '700'
            }}>Error Loading Lease</h3>
            <p style={{
              color: 'var(--text-secondary)', 
              marginBottom: '2.5rem',
              fontSize: '1.1rem'
            }}>
              {error}
            </p>
            <button 
              onClick={() => navigate("/tenant/dashboard")}
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
              ← Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!leaseData) {
    return (
      <div className="dashboard-container" style={{background: 'var(--bg-primary)', minHeight: '100vh'}}>
        <Navbar />
        <div className="premium-container">
          <div className="error-state" style={{
            textAlign: 'center', 
            padding: '5rem 2rem',
            background: 'var(--bg-card)',
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            marginTop: '2rem'
          }}>
            <div style={{
              fontSize: '5rem', 
              marginBottom: '1.5rem',
              filter: 'drop-shadow(0 4px 12px rgba(239, 68, 68, 0.3))'
            }}>❌</div>
            <h3 style={{
              color: 'var(--text-primary)', 
              marginBottom: '1rem',
              fontSize: '1.75rem',
              fontWeight: '700'
            }}>Lease Not Found</h3>
            <p style={{
              color: 'var(--text-secondary)', 
              marginBottom: '2.5rem',
              fontSize: '1.1rem'
            }}>
              The requested lease agreement could not be loaded.
            </p>
            <button 
              onClick={() => navigate("/tenant/dashboard")}
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
              ← Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isPending = leaseData.status === "PENDING";
  const isActive = leaseData.status === "ACTIVE";

  return (
    <div className="dashboard-container" style={{background: 'var(--bg-primary)', minHeight: '100vh'}}>
      <Navbar />
      
      <div className="premium-container" style={{maxWidth: '1200px', margin: '0 auto', padding: '0 1rem'}}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          marginTop: '2rem'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <button 
              onClick={() => navigate("/tenant/dashboard")}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(102, 126, 234, 0.1)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
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
              ← Back
            </button>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
                background: 'var(--gradient-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Lease Agreement</h1>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '1.1rem'
              }}>Review your rental agreement carefully</p>
            </div>
          </div>
          {getStatusBadge(leaseData.status)}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {isPending && (
            <>
              <button 
                onClick={handleAcceptLease} 
                disabled={signing}
                style={{
                  padding: '1rem 2rem',
                  background: 'var(--accent-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: signing ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!signing) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = 'var(--shadow-glow)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                {signing ? '⏳' : '✅'}
                {signing ? "Accepting..." : "Accept Lease & Pay Deposit"}
              </button>
              <button
                onClick={handleRejectLease}
                disabled={signing}
                style={{
                  padding: '1rem 2rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: signing ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!signing) {
                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                }}
              >
                {signing ? '⏳' : '❌'}
                {signing ? "Rejecting..." : "Reject Lease"}
              </button>
            </>
          )}
          
          {/* PAYMENT BUTTON - Show for active leases */}
          {isActive && (
            <button 
              onClick={handleMakePayment}
              style={{
                padding: '1rem 2rem',
                background: 'var(--accent-green)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
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
              💳 Make Payment
            </button>
          )}
          
          <button 
            onClick={handleDownloadLease}
            style={{
              padding: '1rem 2rem',
              background: 'rgba(102, 126, 234, 0.1)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
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
            📥 Download PDF
          </button>
        </div>

        {/* Main Lease Card */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}>
          {/* Card Header */}
          <div style={{
            background: 'var(--primary-gradient)',
            color: 'white',
            padding: '2rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span>📄</span>
                Lease Agreement #{leaseData._id?.slice(-8).toUpperCase()}
              </h2>
              <div style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.9rem'
              }}>
                Created {new Date(leaseData.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div style={{padding: '2rem'}}>
            {/* Quick Overview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>💰</div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {formatCurrency(leaseData.rentAmount)}
                </div>
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>Monthly Rent</div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🏠</div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {unitDetails?.unitNumber || "N/A"}
                </div>
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>Unit Number</div>
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📅</div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {leaseData.startDate
                    ? new Date(leaseData.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : "N/A"}
                </div>
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>Lease Start</div>
              </div>

              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🚗</div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {unitDetails?.parkingSpots || "N/A"}
                </div>
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>Parking Spots</div>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid rgba(102, 126, 234, 0.1)',
              margin: '2rem 0'
            }}></div>

            {/* Property & Lease Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              {/* Left Column */}
              <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <span style={{fontSize: '1.5rem'}}>📍</span>
                  <div>
                    <h3 style={{
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                      fontSize: '1.1rem'
                    }}>Property Address</h3>
                    <p style={{
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      margin: 0
                    }}>{getPropertyAddress()}</p>
                    {propertyDetails?.name && (
                      <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        marginTop: '0.5rem'
                      }}>{propertyDetails.name}</p>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <span style={{fontSize: '1.5rem'}}>📅</span>
                  <div>
                    <h3 style={{
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                      fontSize: '1.1rem'
                    }}>Lease Term</h3>
                    <p style={{
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: '1.6'
                    }}>
                      {leaseData.startDate ? new Date(leaseData.startDate).toLocaleDateString() : "Not set"} to{" "}
                      {leaseData.endDate ? new Date(leaseData.endDate).toLocaleDateString() : "Not set"}
                    </p>
                    <p style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem',
                      marginTop: '0.5rem'
                    }}>
                      Rent due on {leaseData.dueDay || 1}st of each month
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <span style={{fontSize: '1.5rem'}}>👤</span>
                  <div>
                    <h3 style={{
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                      fontSize: '1.1rem'
                    }}>Security Deposit</h3>
                    <p style={{
                      color: 'var(--text-primary)',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      margin: 0
                    }}>
                      {formatCurrency(leaseData.depositAmount)}
                    </p>
                    <p style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem',
                      marginTop: '0.5rem'
                    }}>Due upon lease acceptance</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.05)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid rgba(245, 158, 11, 0.1)'
                }}>
                  <h3 style={{
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>💰</span>
                    Financial Terms
                  </h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{color: 'var(--text-secondary)'}}>Monthly Rent:</span>
                      <span style={{fontWeight: '600', color: 'var(--text-primary)'}}>
                        {formatCurrency(leaseData.rentAmount)}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{color: 'var(--text-secondary)'}}>Security Deposit:</span>
                      <span style={{fontWeight: '600', color: 'var(--text-primary)'}}>
                        {formatCurrency(leaseData.depositAmount)}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{color: 'var(--text-secondary)'}}>Rent Due Date:</span>
                      <span style={{fontWeight: '600', color: 'var(--text-primary)'}}>
                        {leaseData.dueDay || 1}st of each month
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{color: 'var(--text-secondary)'}}>Lease Status:</span>
                      {getStatusBadge(leaseData.status)}
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                {leaseData.documents && leaseData.documents.length > 0 && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid rgba(16, 185, 129, 0.1)'
                  }}>
                    <h3 style={{
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '1rem',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>📄</span>
                      Lease Documents
                    </h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                      {leaseData.documents.map((doc, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          background: 'var(--bg-primary)',
                          borderRadius: '8px',
                          border: '1px solid rgba(102, 126, 234, 0.1)'
                        }}>
                          <span style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>{doc.name}</span>
                          <button
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'rgba(102, 126, 234, 0.1)',
                              color: 'var(--text-primary)',
                              border: '1px solid rgba(102, 126, 234, 0.3)',
                              borderRadius: '6px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
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
                            onClick={() => window.open(doc.url, "_blank")}
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Message */}
            {isPending && (
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                marginBottom: '1.5rem'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <span style={{fontSize: '1.5rem'}}>⏰</span>
                  <div>
                    <h4 style={{
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                      fontSize: '1.1rem'
                    }}>Action Required</h4>
                    <p style={{
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: '1.6'
                    }}>
                      Please review and accept or reject this lease agreement. Once accepted, it becomes a legally
                      binding contract.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Legal Notice */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.05)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
              <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem'}}>
                <span style={{fontSize: '1.5rem'}}>⚠️</span>
                <div>
                  <p style={{
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem'
                  }}>Important Legal Notice</p>
                  <p style={{
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: '1.6',
                    fontSize: '0.9rem'
                  }}>
                    This lease agreement was prepared and sent by your landlord. Please review all terms carefully
                    before signing. Once accepted, this becomes a legally binding contract. It is recommended to keep a
                    copy for your records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TenantLeasePreview;
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar.jsx';
import Footer from '../../components/common/Footer.jsx';

const CreateMaintenanceTicket = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unitId = searchParams.get('unitId');

  const [formData, setFormData] = useState({
    unitId: unitId || '',
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    attachments: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [leases, setLeases] = useState([]);

  const categories = [
    { value: 'PLUMBING', label: '🚰 Plumbing', description: 'Leaks, clogged drains, toilet issues' },
    { value: 'ELECTRICAL', label: '💡 Electrical', description: 'Power outages, wiring issues, lighting' },
    { value: 'HVAC', label: '❄️ HVAC', description: 'Heating, cooling, ventilation systems' },
    { value: 'APPLIANCE', label: '🔌 Appliance', description: 'Refrigerator, oven, dishwasher issues' },
    { value: 'GENERAL', label: '🔧 General', description: 'Other maintenance requests' }
  ];

  const priorities = [
    { value: 'LOW', label: 'Low', color: '#10b981', description: 'Minor issue, no urgency' },
    { value: 'MEDIUM', label: 'Medium', color: '#f59e0b', description: 'Should be addressed soon' },
    { value: 'HIGH', label: 'High', color: '#ef4444', description: 'Affects daily living' },
    { value: 'URGENT', label: 'Urgent', color: '#dc2626', description: 'Emergency situation' }
  ];

  useEffect(() => {
    fetchActiveLeases();
  }, []);

  const fetchActiveLeases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiCall(`/leases/my-active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLeases(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching leases:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('unitId', formData.unitId);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      
      // Append files
      formData.attachments.forEach(file => {
        formDataToSend.append('attachments', file);
      });

      const response = await apiCall(`/maintenance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Maintenance ticket created successfully!');
        setTimeout(() => {
          navigate('/tenant/maintenance-tickets');
        }, 2000);
      } else {
        setError(result.message || 'Failed to create maintenance ticket');
      }
    } catch (err) {
      console.error('Error creating maintenance ticket:', err);
      setError('Failed to create maintenance ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityStyle = (priorityValue) => {
    const priority = priorities.find(p => p.value === priorityValue);
    return {
      backgroundColor: `${priority.color}15`,
      color: priority.color,
      border: `1px solid ${priority.color}30`,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    };
  };

  return (
    <div className="dashboard-container" style={{background: 'var(--bg-primary)', minHeight: '100vh'}}>
      <Navbar />
      
      <div className="premium-container" style={{maxWidth: '800px', margin: '0 auto', padding: '0 1rem'}}>
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
          <Link to="/tenant/leased-properties" className="breadcrumb-link" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            My Leased Properties
          </Link>
          <span style={{color: 'var(--text-muted)'}}>/</span>
          <span className="breadcrumb-current" style={{
            color: 'var(--text-primary)',
            fontWeight: '600'
          }}>Request Maintenance</span>
        </nav>

        {/* Page Header */}
        <div className="page-header" style={{
          textAlign: 'center',
          marginBottom: '3rem',
          padding: '2rem 0'
        }}>
          <h1 className="page-title" style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            background: 'var(--gradient-hero)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Request Maintenance</h1>
          <p className="page-subtitle" style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Submit a maintenance request for your leased property. Our team will address it promptly.
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
              <strong style={{display: 'block', marginBottom: '0.5rem'}}>Success!</strong> {success}
            </div>
          </div>
        )}

        {/* Maintenance Form */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '20px',
          padding: '2.5rem',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Unit Selection */}
            <div style={{marginBottom: '2rem'}}>
              <label style={{
                display: 'block',
                color: 'var(--text-primary)',
                fontWeight: '600',
                marginBottom: '0.75rem',
                fontSize: '1.1rem'
              }}>
                Select Property Unit *
              </label>
              <select
                name="unitId"
                value={formData.unitId}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-light)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Choose a unit...</option>
                {leases.map(lease => (
                  <option key={lease.unitId._id} value={lease.unitId._id}>
                    {lease.unitId.propertyId.name} - Unit {lease.unitId.unitNumber}
                  </option>
                ))}
              </select>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                marginTop: '0.5rem'
              }}>
                Only units with active leases are shown
              </p>
            </div>

            {/* Title */}
            <div style={{marginBottom: '2rem'}}>
              <label style={{
                display: 'block',
                color: 'var(--text-primary)',
                fontWeight: '600',
                marginBottom: '0.75rem',
                fontSize: '1.1rem'
              }}>
                Issue Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief description of the issue (e.g., 'Kitchen sink leaking')"
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-light)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Category */}
            <div style={{marginBottom: '2rem'}}>
              <label style={{
                display: 'block',
                color: 'var(--text-primary)',
                fontWeight: '600',
                marginBottom: '0.75rem',
                fontSize: '1.1rem'
              }}>
                Category *
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {categories.map(category => (
                  <label key={category.value} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem',
                    border: `2px solid ${
                      formData.category === category.value 
                        ? 'var(--primary-light)' 
                        : 'rgba(102, 126, 234, 0.1)'
                    }`,
                    borderRadius: '12px',
                    backgroundColor: formData.category === category.value 
                      ? 'rgba(102, 126, 234, 0.05)' 
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.5rem'
                    }}>
                      <input
                        type="radio"
                        name="category"
                        value={category.value}
                        checked={formData.category === category.value}
                        onChange={handleInputChange}
                        style={{ display: 'none' }}
                      />
                      <span style={{fontSize: '1.5rem'}}>{category.label.split(' ')[0]}</span>
                      <span style={{
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                      }}>{category.label.split(' ').slice(1).join(' ')}</span>
                    </div>
                    <span style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem',
                      lineHeight: '1.4'
                    }}>{category.description}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div style={{marginBottom: '2rem'}}>
              <label style={{
                display: 'block',
                color: 'var(--text-primary)',
                fontWeight: '600',
                marginBottom: '0.75rem',
                fontSize: '1.1rem'
              }}>
                Priority Level *
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                {priorities.map(priority => (
                  <label key={priority.value} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem',
                    border: `2px solid ${
                      formData.priority === priority.value 
                        ? priority.color 
                        : 'rgba(102, 126, 234, 0.1)'
                    }`,
                    borderRadius: '12px',
                    backgroundColor: formData.priority === priority.value 
                      ? `${priority.color}15` 
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}>
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={handleInputChange}
                      style={{ display: 'none' }}
                    />
                    <div style={getPriorityStyle(priority.value)}>
                      {priority.label}
                    </div>
                    <span style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      marginTop: '0.5rem',
                      lineHeight: '1.3'
                    }}>{priority.description}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{marginBottom: '2rem'}}>
              <label style={{
                display: 'block',
                color: 'var(--text-primary)',
                fontWeight: '600',
                marginBottom: '0.75rem',
                fontSize: '1.1rem'
              }}>
                Detailed Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please provide detailed information about the issue, when it started, and any other relevant details..."
                required
                rows="6"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  resize: 'vertical',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-light)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Attachments */}
            <div style={{marginBottom: '3rem'}}>
              <label style={{
                display: 'block',
                color: 'var(--text-primary)',
                fontWeight: '600',
                marginBottom: '0.75rem',
                fontSize: '1.1rem'
              }}>
                Attachments (Optional)
              </label>
              <div style={{
                border: '2px dashed rgba(102, 126, 234, 0.3)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--primary-light)';
                e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload" style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{fontSize: '3rem'}}>📎</div>
                  <div>
                    <div style={{
                      color: 'var(--text-primary)',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Upload Photos or Documents
                    </div>
                    <div style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem'
                    }}>
                      Drag & drop files here or click to browse
                    </div>
                    <div style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      marginTop: '0.5rem'
                    }}>
                      Supports images, PDF, Word documents (Max 5 files)
                    </div>
                  </div>
                </label>
              </div>
              {formData.attachments.length > 0 && (
                <div style={{marginTop: '1rem'}}>
                  <div style={{
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>Selected files:</div>
                  {formData.attachments.map((file, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      background: 'rgba(102, 126, 234, 0.05)',
                      borderRadius: '8px',
                      marginBottom: '0.25rem'
                    }}>
                      <span>📄</span>
                      <span style={{
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem'
                      }}>{file.name}</span>
                      <span style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem'
                      }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => navigate('/tenant/leased-properties')}
                style={{
                  padding: '1rem 2rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '1rem',
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '1rem 2rem',
                  background: loading ? '#9ca3af' : 'var(--primary-gradient)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = 'var(--shadow-glow)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'var(--shadow-md)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    🛠️ Submit Maintenance Request
                  </>
                )}
              </button>
            </div>
          </form>
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

export default CreateMaintenanceTicket;
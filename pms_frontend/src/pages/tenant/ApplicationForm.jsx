import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar.jsx';
import Footer from '../../components/common/Footer.jsx';
import { apiCall } from "../../services/api";

const ApplicationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unitId, unitNumber, propertyId, rentAmount, propertyName } = location.state || {};

  // Form state
  const [formData, setFormData] = useState({
    unitId: unitId || '',
    note: '',
    docs: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [property, setProperty] = useState(null);
  const [unit, setUnit] = useState(null);
  const [consent, setConsent] = useState(false);
  const [stepErrors, setStepErrors] = useState({});

  useEffect(() => {
    if (!unitId) {
      setError('No unit selected. Please go back and select a unit to apply for.');
      return;
    }
    fetchPropertyAndUnitDetails();
  }, [unitId]);
  

const fetchPropertyAndUnitDetails = async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // Fetch unit details
    if (unitId) {
      const unitData = await apiCall(`/units/${unitId}`, { headers });

      if (unitData.success) {
        setUnit(unitData.data);

        // Extract propertyId safely
        const propertyRef = unitData.data.propertyId;
        const propertyIdValue =
          typeof propertyRef === "string"
            ? propertyRef
            : propertyRef?._id;

        // Fetch property details
        if (propertyIdValue) {
          const propertyData = await apiCall(`/properties/${propertyIdValue}`, {
            headers,
          });

          if (propertyData.success) {
            setProperty(propertyData.data);
          } else {
            console.error("Failed to load property details");
          }
        }
      } else {
        console.error("Failed to load unit details:", unitData.message);
      }
    }
  } catch (err) {
    console.error("Error fetching details:", err);
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear step errors when user starts typing
    if (stepErrors[name]) {
      setStepErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    let fileErrors = [];

    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        fileErrors.push(`Invalid file type: ${file.name}`);
        return false;
      }

      if (file.size > maxSize) {
        fileErrors.push(`File too large: ${file.name} (max 5MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length + uploadedFiles.length > 5) {
      fileErrors.push('Maximum 5 documents allowed');
    }

    if (fileErrors.length > 0) {
      setError(fileErrors.join('. '));
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    setError('');
    // Clear step errors when files are uploaded
    if (stepErrors.documents) {
      setStepErrors(prev => ({ ...prev, documents: '' }));
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Validation functions for each step
  const validateStep1 = () => {
    const errors = {};
    
    // Note is optional, so no validation needed
    
    return errors;
  };

  const validateStep2 = () => {
    const errors = {};
    
    if (uploadedFiles.length === 0) {
      errors.documents = 'Please upload at least one document to support your application';
    }
    
    return errors;
  };

  const validateStep3 = () => {
    const errors = {};
    
    if (!consent) {
      errors.consent = 'You must agree to the terms and conditions to submit your application';
    }
    
    return errors;
  };

  const nextStep = () => {
    let errors = {};
    
    switch (currentStep) {
      case 1:
        errors = validateStep1();
        break;
      case 2:
        errors = validateStep2();
        break;
      default:
        break;
    }

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }

    setStepErrors({});
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStepErrors({});
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Final validation before submission
    const step3Errors = validateStep3();
    if (Object.keys(step3Errors).length > 0) {
      setStepErrors(step3Errors);
      setLoading(false);
      return;
    }

    // Also validate previous steps
    const step2Errors = validateStep2();
    if (Object.keys(step2Errors).length > 0) {
      setStepErrors(step2Errors);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to submit application');
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('unitId', formData.unitId);
      submitData.append('note', formData.note);
      
      // Append all files
      uploadedFiles.forEach(file => {
        submitData.append('docs', file);
      });

      const response = await apiCall(`/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      if (data.success) {
        setSuccess('Application submitted successfully!');
        setTimeout(() => {
          navigate('/tenant/dashboard', { 
            state: { 
              applicationSuccess: true,
              applicationId: data.data._id 
            }
          });
        }, 2000);
      } else {
        throw new Error(data.message || 'Application submission failed');
      }
    } catch (err) {
      console.error('Application error:', err);
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // If no unit selected, show error
  if (!unitId) {
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
            }}>No Unit Selected</h3>
            <p style={{
              color: 'var(--text-secondary)', 
              marginBottom: '2.5rem',
              fontSize: '1.1rem'
            }}>
              Please select a unit to apply for from the property details page.
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
              Browse Properties
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
          <span style={{color: 'var(--text-muted)'}}>/</span>
          <span className="breadcrumb-current" style={{
            color: 'var(--text-primary)',
            fontWeight: '600'
          }}>Application Form</span>
        </nav>

        {/* Application Header */}
        <div className="application-header" style={{
          textAlign: 'center',
          marginBottom: '3rem',
          padding: '2rem 0'
        }}>
          <h1 className="application-title" style={{
            fontSize: '3rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            background: 'var(--gradient-hero)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Rental Application</h1>
          <p className="application-subtitle" style={{
            fontSize: '1.3rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Complete your application for {unitNumber ? `Unit ${unitNumber}` : 'the selected unit'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="application-progress" style={{
          marginBottom: '3rem',
          background: 'var(--bg-card)',
          padding: '2rem',
          borderRadius: '20px',
          border: '1px solid rgba(90, 122, 110, 0.1)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div className="progress-steps" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}>
            {[1, 2, 3].map((step) => (
              <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''}`} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                position: 'relative'
              }}>
                <div className="step-number" style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '1.2rem',
                  marginBottom: '0.75rem',
                  background: currentStep >= step ? 'var(--primary-gradient)' : 'rgba(90, 122, 110, 0.1)',
                  color: currentStep >= step ? 'white' : 'var(--text-muted)',
                  border: currentStep >= step ? 'none' : '2px solid rgba(90, 122, 110, 0.3)',
                  boxShadow: currentStep >= step ? 'var(--shadow-md)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {step}
                </div>
                <div className="step-label" style={{
                  color: currentStep >= step ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: currentStep >= step ? '600' : '500',
                  fontSize: '0.9rem',
                  marginTop:'3rem',
                  textAlign: 'center'
                }}>
                  {step === 1 && 'Application Details'}
                  {step === 2 && 'Documents Upload'}
                  {step === 3 && 'Review & Submit'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Summary Card */}
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
              <strong style={{color: 'var(--text-primary)'}}>Unit:</strong> 
              <span style={{color: 'var(--text-secondary)'}}>{unitNumber ? `Unit ${unitNumber}` : 'Loading...'}</span>
            </div>
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
              <span style={{color: 'var(--text-secondary)'}}> {property?.name 
    ? property.name 
    : propertyName 
      ? propertyName 
      : 'Loading...'}</span>
            </div>
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
              }}>{formatCurrency(unit?.rentAmount || rentAmount)}</span>
            </div>
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
                <span style={{color: 'var(--text-secondary)'}}>{getPropertyAddress(property)}</span>
              </div>
            )}
          </div>
        </div>

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

        {/* Step Errors */}
        {Object.keys(stepErrors).length > 0 && (
          <div className="alert alert-warning" style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
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
              <strong style={{display: 'block', marginBottom: '0.5rem'}}>Please complete the following:</strong>
              <ul style={{margin: 0, paddingLeft: '1.5rem'}}>
                {Object.values(stepErrors).map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="application-form" style={{
          background: 'var(--bg-card)',
          padding: '3rem',
          borderRadius: '24px',
          border: '1px solid rgba(90, 122, 110, 0.1)',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '3rem'
        }}>
          {/* Step 1: Application Details */}
          {currentStep === 1 && (
            <div className="form-step">
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                background: 'var(--gradient-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Application Details</h2>
              <p className="step-description" style={{
                color: 'var(--text-secondary)',
                fontSize: '1.2rem',
                marginBottom: '2.5rem',
                lineHeight: '1.6'
              }}>
                Please provide additional information for your application.
              </p>

              <div className="form-group-premium" style={{marginBottom: '2.5rem'}}>
                <label className="form-label-premium" style={{
                  display: 'block',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  fontSize: '1.1rem'
                }}>
                  Additional Notes <span className="optional" style={{
                    color: 'var(--text-muted)',
                    fontWeight: '400'
                  }}>(Optional)</span>
                </label>
                <textarea
                  name="note"
                  placeholder="Tell us about yourself, your rental needs, or any special requirements..."
                  value={formData.note}
                  onChange={handleInputChange}
                  className="form-textarea-premium"
                  rows="6"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    background: 'var(--bg-primary)',
                    border: '1px solid rgba(90, 122, 110, 0.3)',
                    borderRadius: '16px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    resize: 'vertical',
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
                <div className="form-hint" style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  marginTop: '0.75rem'
                }}>
                  This information helps us understand your application better.
                </div>
              </div>

              <div className="form-requirements" style={{
                background: 'rgba(90, 122, 110, 0.05)',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid rgba(90, 122, 110, 0.1)'
              }}>
                <h4 style={{
                  color: 'var(--text-primary)',
                  marginBottom: '1.5rem',
                  fontSize: '1.3rem',
                  fontWeight: '700'
                }}>Application Requirements</h4>
                <ul style={{
                  color: 'var(--text-secondary)',
                  paddingLeft: '1.5rem',
                  margin: 0,
                  fontSize: '1.1rem',
                  lineHeight: '1.8'
                }}>
                  <li>✅ Valid government-issued photo ID</li>
                  <li>✅ Proof of income (last 3 pay stubs or employment letter)</li>
                  <li>✅ Credit report (optional but recommended)</li>
                  <li>✅ Rental history references</li>
                  <li>✅ Emergency contact information</li>
                </ul>
              </div>

              <div className="form-actions" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '3rem',
                gap: '1rem'
              }}>
                <button
                  type="button"
                  className="btn-premium btn-secondary"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  style={{
                    padding: '1rem 2rem',
                    background: 'rgba(90, 122, 110, 0.1)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(90, 122, 110, 0.3)',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
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
                  ← Back
                </button>
                <button
                  type="button"
                  className="btn-premium btn-primary"
                  onClick={nextStep}
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
                  Continue to Documents →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Documents Upload */}
          {currentStep === 2 && (
            <div className="form-step">
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                background: 'var(--gradient-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Supporting Documents</h2>
              <p className="step-description" style={{
                color: 'var(--text-secondary)',
                fontSize: '1.2rem',
                marginBottom: '2.5rem',
                lineHeight: '1.6'
              }}>
                Upload required documents to support your application. You can upload up to 5 files.
              </p>

              {stepErrors.documents && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--text-primary)',
                  padding: '1rem',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>⚠️</span>
                  <span>{stepErrors.documents}</span>
                </div>
              )}

              <div className="upload-section" style={{marginBottom: '2.5rem'}}>
                <div className="upload-area" style={{
                  border: `2px dashed ${stepErrors.documents ? 'rgba(239, 68, 68, 0.5)' : 'rgba(90, 122, 110, 0.3)'}`,
                  borderRadius: '20px',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  background: stepErrors.documents ? 'rgba(239, 68, 68, 0.05)' : 'rgba(90, 122, 110, 0.05)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = stepErrors.documents ? 'rgba(239, 68, 68, 0.7)' : 'rgba(90, 122, 110, 0.5)';
                  e.currentTarget.style.background = stepErrors.documents ? 'rgba(239, 68, 68, 0.08)' : 'rgba(90, 122, 110, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = stepErrors.documents ? 'rgba(239, 68, 68, 0.5)' : 'rgba(90, 122, 110, 0.3)';
                  e.currentTarget.style.background = stepErrors.documents ? 'rgba(239, 68, 68, 0.05)' : 'rgba(90, 122, 110, 0.05)';
                }}
                >
                  <div className="upload-icon" style={{fontSize: '4rem', marginBottom: '1rem'}}>📁</div>
                  <h4 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '1rem',
                    fontSize: '1.3rem',
                    fontWeight: '700'
                  }}>Upload Documents</h4>
                  <p className="upload-text" style={{
                    color: 'var(--text-secondary)',
                    marginBottom: '1.5rem',
                    fontSize: '1.1rem'
                  }}>
                    Drag & drop files here or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="file-input"
                    disabled={loading || uploadedFiles.length >= 5}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <div className="upload-requirements" style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    lineHeight: '1.6'
                  }}>
                    <strong>Accepted formats:</strong> PDF, JPG, PNG, DOC, DOCX<br />
                    <strong>Max file size:</strong> 5MB per file<br />
                    <strong>Max files:</strong> 5
                  </div>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="uploaded-files" style={{marginTop: '2rem'}}>
                    <h4 style={{
                      color: 'var(--text-primary)',
                      marginBottom: '1.5rem',
                      fontSize: '1.2rem',
                      fontWeight: '600'
                    }}>Uploaded Documents ({uploadedFiles.length}/5)</h4>
                    <div className="files-list" style={{
                      display: 'grid',
                      gap: '1rem'
                    }}>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="file-item" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1.25rem',
                          background: 'rgba(90, 122, 110, 0.05)',
                          borderRadius: '12px',
                          border: '1px solid rgba(90, 122, 110, 0.1)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(90, 122, 110, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(90, 122, 110, 0.05)';
                        }}
                        >
                          <div className="file-info" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                          }}>
                            <span className="file-icon" style={{fontSize: '1.5rem'}}>
                              {file.type.includes('pdf') ? '📄' : 
                               file.type.includes('image') ? '🖼️' : '📝'}
                            </span>
                            <div className="file-details">
                              <div className="file-name" style={{
                                color: 'var(--text-primary)',
                                fontWeight: '500',
                                marginBottom: '0.25rem'
                              }}>{file.name}</div>
                              <div className="file-size" style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.85rem'
                              }}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="file-remove"
                            onClick={() => removeFile(index)}
                            disabled={loading}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: 'var(--text-primary)',
                              padding: '0.5rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="document-tips" style={{
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <h4 style={{
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>💡 Document Tips</h4>
                <ul style={{
                  color: 'var(--text-secondary)',
                  paddingLeft: '1.5rem',
                  margin: 0,
                  lineHeight: '1.8'
                }}>
                  <li>Ensure documents are clear and readable</li>
                  <li>Include all pages for multi-page documents</li>
                  <li>Redact sensitive information like Social Security numbers</li>
                  <li>Name files descriptively (e.g., "PayStub_January.pdf")</li>
                </ul>
              </div>

              <div className="form-actions" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '3rem',
                gap: '1rem'
              }}>
                <button
                  type="button"
                  className="btn-premium btn-secondary"
                  onClick={prevStep}
                  disabled={loading}
                  style={{
                    padding: '1rem 2rem',
                    background: 'rgba(90, 122, 110, 0.1)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(90, 122, 110, 0.3)',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
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
                  ← Back to Details
                </button>
                <button
                  type="button"
                  className="btn-premium btn-primary"
                  onClick={nextStep}
                  disabled={loading || uploadedFiles.length === 0}
                  style={{
                    padding: '1rem 2rem',
                    background: uploadedFiles.length === 0 ? 'rgba(90, 122, 110, 0.3)' : 'var(--primary-gradient)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: uploadedFiles.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: uploadedFiles.length === 0 ? 'none' : 'var(--shadow-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: uploadedFiles.length === 0 ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (uploadedFiles.length > 0) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = 'var(--shadow-glow)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = uploadedFiles.length === 0 ? 'none' : 'var(--shadow-md)';
                  }}
                >
                  Review Application →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="form-step">
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                background: 'var(--gradient-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Review Your Application</h2>
              <p className="step-description" style={{
                color: 'var(--text-secondary)',
                fontSize: '1.2rem',
                marginBottom: '2.5rem',
                lineHeight: '1.6'
              }}>
                Please review your application details before submitting.
              </p>

              <div className="review-section" style={{
                display: 'grid',
                gap: '2rem',
                marginBottom: '2.5rem'
              }}>
                <div className="review-card" style={{
                  background: 'rgba(90, 122, 110, 0.05)',
                  padding: '2rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(90, 122, 110, 0.1)'
                }}>
                  <h4 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '1.5rem',
                    fontSize: '1.3rem',
                    fontWeight: '700'
                  }}>Application Details</h4>
                  <div className="review-item" style={{
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'rgba(90, 122, 110, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <strong style={{color: 'var(--text-primary)'}}>Unit:</strong> 
                    <span style={{color: 'var(--text-secondary)'}}>{unitNumber ? `Unit ${unitNumber}` : 'N/A'}</span>
                  </div>
                  <div className="review-item" style={{
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'rgba(90, 122, 110, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <strong style={{color: 'var(--text-primary)'}}>Property:</strong> 
                    <span style={{color: 'var(--text-secondary)'}}> {property?.name 
    ? property.name 
    : propertyName 
      ? propertyName 
      : 'Loading...'}</span>
                  </div>
                  <div className="review-item">
                    <strong style={{color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem'}}>Additional Notes:</strong>
                    <div className="review-notes" style={{
                      background: 'var(--bg-primary)',
                      padding: '1rem',
                      borderRadius: '8px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      border: '1px solid rgba(90, 122, 110, 0.1)'
                    }}>
                      {formData.note || 'No additional notes provided'}
                    </div>
                  </div>
                </div>

                <div className="review-card" style={{
                  background: 'rgba(90, 122, 110, 0.05)',
                  padding: '2rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(90, 122, 110, 0.1)'
                }}>
                  <h4 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '1.5rem',
                    fontSize: '1.3rem',
                    fontWeight: '700'
                  }}>Documents ({uploadedFiles.length})</h4>
                  {uploadedFiles.length > 0 ? (
                    <ul className="review-documents" style={{
                      color: 'var(--text-secondary)',
                      paddingLeft: '1.5rem',
                      margin: 0,
                      lineHeight: '1.8'
                    }}>
                      {uploadedFiles.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-documents" style={{
                      color: 'var(--text-muted)',
                      fontStyle: 'italic'
                    }}>No documents uploaded</p>
                  )}
                </div>

                <div className="review-card important" style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  padding: '2rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(245, 158, 11, 0.2)'
                }}>
                  <h4 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '1.5rem',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>⚠️ Important Information</h4>
                  <ul style={{
                    color: 'var(--text-secondary)',
                    paddingLeft: '1.5rem',
                    margin: 0,
                    lineHeight: '1.8'
                  }}>
                    <li>Application fee may be required upon approval</li>
                    <li>Background and credit checks will be performed</li>
                    <li>You will be notified of application status within 3-5 business days</li>
                    <li>Providing false information may result in application denial</li>
                  </ul>
                </div>
              </div>

              <div className="consent-section" style={{
                background: stepErrors.consent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(90, 122, 110, 0.05)',
                border: stepErrors.consent ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(90, 122, 110, 0.1)',
                padding: '2rem',
                borderRadius: '16px',
                marginBottom: '2.5rem'
              }}>
                <label className="consent-checkbox" style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  lineHeight: '1.6'
                }}>
                  <input 
                    type="checkbox" 
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (stepErrors.consent) {
                        setStepErrors(prev => ({ ...prev, consent: '' }));
                      }
                    }}
                    style={{
                      marginTop: '0.25rem',
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--primary-light)'
                    }} 
                  />
                  <span>
                    I certify that the information provided is true and accurate to the best of my knowledge. 
                    I authorize the verification of this information including credit and background checks.
                  </span>
                </label>
                {stepErrors.consent && (
                  <div style={{
                    color: 'rgba(239, 68, 68, 0.9)',
                    fontSize: '0.875rem',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>⚠️</span>
                    {stepErrors.consent}
                  </div>
                )}
              </div>

              <div className="form-actions" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <button
                  type="button"
                  className="btn-premium btn-secondary"
                  onClick={prevStep}
                  disabled={loading}
                  style={{
                    padding: '1rem 2rem',
                    background: 'rgba(90, 122, 110, 0.1)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(90, 122, 110, 0.3)',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
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
                  ← Back to Documents
                </button>
                <button
                  type="submit"
                  className="btn-premium btn-primary"
                  disabled={loading || !consent || uploadedFiles.length === 0}
                  style={{
                    padding: '1rem 2rem',
                    background: (!consent || uploadedFiles.length === 0) ? 'rgba(90, 122, 110, 0.3)' : 'var(--primary-gradient)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: (!consent || uploadedFiles.length === 0) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: (!consent || uploadedFiles.length === 0) ? 'none' : 'var(--shadow-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    minWidth: '180px',
                    justifyContent: 'center',
                    opacity: (!consent || uploadedFiles.length === 0) ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (consent && uploadedFiles.length > 0) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = 'var(--shadow-glow)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = (!consent || uploadedFiles.length === 0) ? 'none' : 'var(--shadow-md)';
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
                      Submitting...
                    </span>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Application Help */}
        <div className="application-help" style={{
          background: 'var(--bg-card)',
          padding: '3rem',
          borderRadius: '24px',
          border: '1px solid rgba(90, 122, 110, 0.1)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '2rem',
            textAlign: 'center',
            background: 'var(--gradient-hero)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Need Help?</h3>
          <div className="help-content" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '📞',
                title: 'Contact Support',
                description: 'Our team is here to help with your application',
                action: 'Contact Us'
              },
              {
                icon: '📋',
                title: 'Application Tips',
                description: 'Ensure all information is accurate and documents are clear',
                action: null
              },
              {
                icon: '⏰',
                title: 'Processing Time',
                description: 'Applications are typically processed within 3-5 business days',
                action: null
              }
            ].map((item, index) => (
              <div key={index} className="help-item" style={{
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
                  marginBottom: '1.5rem',
                  lineHeight: '1.6'
                }}>{item.description}</p>
                {item.action && (
                  <button className="help-link" style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--primary-gradient)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
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
                    {item.action}
                  </button>
                )}
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

export default ApplicationForm;
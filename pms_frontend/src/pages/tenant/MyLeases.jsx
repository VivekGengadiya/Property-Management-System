import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/index.css';
const MyLeases = () => {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Custom Badge component
  const Badge = ({ children, variant = 'default', className = '' }) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    
    const variantClasses = {
      default: "bg-blue-100 text-blue-800",
      secondary: "bg-gray-100 text-gray-800",
      destructive: "bg-red-100 text-red-800",
      outline: "border border-gray-300 text-gray-700 bg-white"
    };

    return (
      <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
        {children}
      </span>
    );
  };

  // Custom Separator component
  const Separator = ({ className = '' }) => (
    <div className={`border-t border-gray-200 my-4 ${className}`} />
  );

  // Custom Button component
  const Button = ({ 
    children, 
    variant = 'default', 
    size = 'default',
    className = '',
    ...props 
  }) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
    
    const variantClasses = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100"
    };

    const sizeClasses = {
      default: "px-4 py-2 text-sm",
      sm: "px-3 py-1.5 text-xs"
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <button className={classes} {...props}>
        {children}
      </button>
    );
  };

  // Fetch leases from backend
  const fetchLeases = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to view leases');
        navigate('/login');
        return;
      }

      const response = await apiCall(`
/leases/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leases');
      }

      const result = await response.json();
      
      if (result.success) {
        setLeases(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to load leases');
      }
    } catch (error) {
      console.error('Error fetching leases:', error);
      alert(error.message || 'Failed to load leases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge variant and icon
  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          variant: 'secondary',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'ACTIVE':
        return {
          variant: 'default',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'REJECTED':
        return {
          variant: 'destructive',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'TERMINATED':
        return {
          variant: 'outline',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          variant: 'outline',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  // Get property address
  const getPropertyAddress = (property) => {
    if (!property) return 'Address not available';
    
    if (property.address) {
      if (typeof property.address === 'object') {
        const { street, city, state, zipCode } = property.address;
        return [street, city, state].filter(Boolean).join(', ');
      }
      return property.address;
    }
    
    return 'Address not available';
  };

  // Icons (using simple text as fallback)
  const FileText = () => <span>📄</span>;
  const Calendar = () => <span>📅</span>;
  const MapPin = () => <span>📍</span>;
  const DollarSign = () => <span>💰</span>;
  const Home = () => <span>🏠</span>;
  const Clock = () => <span>⏰</span>;
  const CheckCircle2 = () => <span>✅</span>;
  const XCircle = () => <span>❌</span>;
  const AlertCircle = () => <span>⚠️</span>;
  const Plus = () => <span>➕</span>;
  const Eye = () => <span>👁️</span>;
  const Loader2 = () => <span>⏳</span>;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your leases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FileText />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            My Leases
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage and review all your rental agreements
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{leases.length}</div>
            <div className="text-gray-600 text-sm">Total Leases</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {leases.filter(lease => lease.status === 'ACTIVE').length}
            </div>
            <div className="text-gray-600 text-sm">Active</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">
              {leases.filter(lease => lease.status === 'PENDING').length}
            </div>
            <div className="text-gray-600 text-sm">Pending</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {leases.filter(lease => ['ACTIVE', 'PENDING'].includes(lease.status)).length}
            </div>
            <div className="text-gray-600 text-sm">Actionable</div>
          </div>
        </div>

        {/* Leases List */}
        {leases.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <FileText />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Leases Found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You don't have any lease agreements yet. When a landlord approves your application, 
              the lease will appear here for review and signing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link to="/tenant/properties" className="flex items-center gap-2 no-underline text-white">
                  <Plus />
                  Browse Properties
                </Link>
              </Button>
              <Button variant="outline">
                <Link to="/tenant/applications" className="flex items-center gap-2 no-underline text-gray-700">
                  View Applications
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          // Leases Grid
          <div className="grid grid-cols-1 gap-6">
            {leases.map((lease) => {
              const statusConfig = getStatusConfig(lease.status);
              const unit = lease.unitId;
              const property = unit?.propertyId;

              return (
                <div 
                  key={lease._id} 
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
                          <span className={statusConfig.color}>
                            {lease.status === 'PENDING' && <Clock />}
                            {lease.status === 'ACTIVE' && <CheckCircle2 />}
                            {lease.status === 'REJECTED' && <XCircle />}
                            {lease.status === 'TERMINATED' && <XCircle />}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {property?.name || 'Unknown Property'} - Unit {unit?.unitNumber || 'N/A'}
                          </h3>
                          <p className="text-gray-600 flex items-center gap-2">
                            <MapPin />
                            {getPropertyAddress(property)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={statusConfig.variant}>
                          {lease.status}
                        </Badge>
                        <Button size="sm" className="flex items-center gap-2">
                          <Link to={`/tenant/lease/${lease._id}`} className="flex items-center gap-2 no-underline text-current">
                            <Eye />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3">
                        <DollarSign />
                        <div>
                          <div className="text-sm text-gray-600">Monthly Rent</div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(lease.rentAmount)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar />
                        <div>
                          <div className="text-sm text-gray-600">Lease Term</div>
                          <div className="font-semibold text-gray-900">
                            {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Home />
                        <div>
                          <div className="text-sm text-gray-600">Unit Type</div>
                          <div className="font-semibold text-gray-900 capitalize">
                            {unit?.type || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <FileText />
                        <div>
                          <div className="text-sm text-gray-600">Due Date</div>
                          <div className="font-semibold text-gray-900">
                            {lease.dueDay || 1}st of month
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Required Banner for Pending Leases */}
                    {lease.status === 'PENDING' && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="flex items-center gap-3">
                          <Clock />
                          <div>
                            <h4 className="font-semibold text-yellow-900">Action Required</h4>
                            <p className="text-yellow-700 text-sm">
                              Please review and respond to this lease agreement
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Active Lease Info */}
                    {lease.status === 'ACTIVE' && (
                      <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 />
                          <div>
                            <h4 className="font-semibold text-green-900">Lease Active</h4>
                            <p className="text-green-700 text-sm">
                              Your lease is currently active. Next rent due on {lease.dueDay || 1}st.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        {leases.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <AlertCircle />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Need Help With Your Lease?</h3>
                <p className="text-blue-700 mb-3">
                  If you have questions about your lease agreement or need assistance, 
                  please contact your landlord directly.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                    Contact Support
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                    Download Lease Guide
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLeases;
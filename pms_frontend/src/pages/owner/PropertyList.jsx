import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import EditProperty from './EditProperty';
import EditUnit from './EditUnit';

const PropertyList = () => {
  const { user, properties, units, deleteProperty, deleteUnit } = useAuth();
  const [activeTable, setActiveTable] = useState('properties');
  const [editingProperty, setEditingProperty] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  
  const ownerProperties = properties.filter(prop => prop.landlordId === user.id);
  const ownerUnits = units.filter(unit => {
    const property = properties.find(prop => prop._id === unit.propertyId);
    return property && property.landlordId === user.id;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'status-available';
      case 'OCCUPIED': return 'status-occupied';
      case 'MAINTENANCE': return 'status-maintenance';
      default: return 'status-available';
    }
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(propertyId);
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await deleteUnit(unitId);
      } catch (error) {
        console.error('Error deleting unit:', error);
      }
    }
  };

  const handleEditSuccess = () => {
    setEditingProperty(null);
    setEditingUnit(null);
  };

  const handleEditCancel = () => {
    setEditingProperty(null);
    setEditingUnit(null);
  };

  // Show edit forms if editing
  if (editingProperty) {
    return (
      <EditProperty 
        property={editingProperty}
        onSuccess={handleEditSuccess}
        onCancel={handleEditCancel}
      />
    );
  }

  if (editingUnit) {
    return (
      <EditUnit 
        unit={editingUnit}
        onSuccess={handleEditSuccess}
        onCancel={handleEditCancel}
      />
    );
  }

  if (ownerProperties.length === 0 && ownerUnits.length === 0) {
    return (
      <div className="empty-state" style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'var(--bg-card)',
        borderRadius: '20px',
        border: '1px solid rgba(90, 122, 110, 0.1)'
      }}>
        <div className="empty-state-icon" style={{
          fontSize: '4rem',
          marginBottom: '1.5rem',
          filter: 'drop-shadow(0 4px 12px rgba(90, 122, 110, 0.3))'
        }}>🏠</div>
        <h3 style={{
          color: 'var(--text-primary)',
          marginBottom: '1rem',
          fontSize: '1.5rem',
          fontWeight: '700'
        }}>No properties or units listed</h3>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.1rem'
        }}>Get started by adding your first property or unit.</p>
      </div>
    );
  }

  return (
    <div className="property-list-container" style={{padding: '2rem'}}>
      {/* Table Selection Tabs */}
      <div className="table-tabs" style={{
        display: 'flex',
        background: 'rgba(90, 122, 110, 0.05)',
        borderRadius: '12px',
        padding: '0.5rem',
        marginBottom: '2rem',
        border: '1px solid rgba(90, 122, 110, 0.1)'
      }}>
        {[
          { key: 'properties', label: 'Properties', count: ownerProperties.length },
          { key: 'units', label: 'Units', count: ownerUnits.length }
        ].map((tab) => (
          <button
            key={tab.key}
            className={`table-tab ${activeTable === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTable(tab.key)}
            style={{
              flex: 1,
              padding: '1rem 1.5rem',
              background: activeTable === tab.key ? 'var(--primary-gradient)' : 'transparent',
              color: activeTable === tab.key ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (activeTable !== tab.key) {
                e.target.style.background = 'rgba(90, 122, 110, 0.1)';
                e.target.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTable !== tab.key) {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--text-secondary)';
              }
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="table-tab-badge" style={{
                background: activeTable === tab.key ? 'rgba(255, 255, 255, 0.2)' : 'rgba(90, 122, 110, 0.1)',
                color: activeTable === tab.key ? 'white' : 'var(--text-primary)',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                minWidth: '24px'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Properties Table */}
      {activeTable === 'properties' && (
        <div className="table-container" style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid rgba(90, 122, 110, 0.1)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}>
          <table className="property-table" style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead style={{
              background: 'rgba(90, 122, 110, 0.05)',
              borderBottom: '1px solid rgba(90, 122, 110, 0.1)'
            }}>
              <tr>
                {['Property', 'Type', 'Amenities', 'Status', 'Actions'].map((header) => (
                  <th key={header} style={{
                    padding: '1.5rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ownerProperties.map(property => (
                <tr key={property._id} style={{
                  borderBottom: '1px solid rgba(90, 122, 110, 0.1)',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(90, 122, 110, 0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                >
                  <td style={{padding: '1.5rem 1rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      {property.images && property.images[0] && (
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          <img
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            src={property.images[0].startsWith('http') ? property.images[0] : `http://localhost:9000${property.images[0]}`}
                            alt={property.name}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          marginBottom: '0.25rem'
                        }}>
                          {property.name}
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)'
                        }}>
                          {property.address?.city || 'Location not specified'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding: '1.5rem 1rem'}}>
                    <div style={{
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                      textTransform: 'capitalize'
                    }}>
                      {property.propertyType?.toLowerCase()}
                    </div>
                  </td>
                  <td style={{padding: '1.5rem 1rem'}}>
                    <div style={{
                      fontSize: '0.95rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {property.amenities?.slice(0, 2).join(', ')}
                      {property.amenities?.length > 2 && '...'}
                    </div>
                  </td>
                  <td style={{padding: '1.5rem 1rem'}}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--accent-green)',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Active
                    </span>
                  </td>
                  <td style={{padding: '1.5rem 1rem'}}>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button
                        onClick={() => handleEditProperty(property)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'rgba(90, 122, 110, 0.1)',
                          color: 'var(--text-primary)',
                          border: '1px solid rgba(90, 122, 110, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(90, 122, 110, 0.2)';
                          e.target.style.borderColor = 'rgba(90, 122, 110, 0.5)';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(90, 122, 110, 0.1)';
                          e.target.style.borderColor = 'rgba(90, 122, 110, 0.3)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property._id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: 'var(--text-primary)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                          e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Units Table */}
      {activeTable === 'units' && (
        <div className="table-container" style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid rgba(90, 122, 110, 0.1)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}>
          <table className="property-table" style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead style={{
              background: 'rgba(90, 122, 110, 0.05)',
              borderBottom: '1px solid rgba(90, 122, 110, 0.1)'
            }}>
              <tr>
                {['Unit', 'Property', 'Details', 'Rent', 'Status', 'Actions'].map((header) => (
                  <th key={header} style={{
                    padding: '1.5rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ownerUnits.map(unit => {
                const property = properties.find(p => p._id === unit.propertyId);
                const getStatusStyle = (status) => {
                  switch (status) {
                    case 'AVAILABLE':
                      return { background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)' };
                    case 'OCCUPIED':
                      return { background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-olive)' };
                    case 'MAINTENANCE':
                      return { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-primary)' };
                    default:
                      return { background: 'rgba(90, 122, 110, 0.1)', color: 'var(--text-secondary)' };
                  }
                };

                const statusStyle = getStatusStyle(unit.status);

                return (
                  <tr key={unit._id} style={{
                    borderBottom: '1px solid rgba(90, 122, 110, 0.1)',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(90, 122, 110, 0.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  >
                    <td style={{padding: '1.5rem 1rem'}}>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                      }}>
                        Unit {unit.unitNumber}
                      </div>
                    </td>
                    <td style={{padding: '1.5rem 1rem'}}>
                      <div style={{
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem'
                      }}>
                        {property?.name || 'Unknown Property'}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                      }}>
                        {property?.address?.city || 'Location not specified'}
                      </div>
                    </td>
                    <td style={{padding: '1.5rem 1rem'}}>
                      <div style={{
                        fontSize: '0.95rem',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem'
                      }}>
                        {unit.bedrooms} bed • {unit.bathrooms} bath
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                      }}>
                        {unit.sqft} sqft
                      </div>
                    </td>
                    <td style={{padding: '1.5rem 1rem'}}>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem'
                      }}>
                        ${unit.rentAmount}/month
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                      }}>
                        Deposit: ${unit.depositAmount || unit.rentAmount}
                      </div>
                    </td>
                    <td style={{padding: '1.5rem 1rem'}}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        background: statusStyle.background,
                        color: statusStyle.color,
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {unit.status}
                      </span>
                    </td>
                    <td style={{padding: '1.5rem 1rem'}}>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          onClick={() => handleEditUnit(unit)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(90, 122, 110, 0.1)',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(90, 122, 110, 0.3)',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(90, 122, 110, 0.2)';
                            e.target.style.borderColor = 'rgba(90, 122, 110, 0.5)';
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(90, 122, 110, 0.1)';
                            e.target.style.borderColor = 'rgba(90, 122, 110, 0.3)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit._id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                            e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                            e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PropertyList;
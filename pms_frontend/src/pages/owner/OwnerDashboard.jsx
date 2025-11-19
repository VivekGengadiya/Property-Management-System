import React, { useState } from 'react';
import PropertyList from './PropertyList';
import AddProperty from './AddProperty';
import AddUnit from './AddUnit';
import OwnerApplications from './OwnerApplications';
import OwnerLeaseForm from './OwnerLeaseForm';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import OwnerMaintenance from './OwnerMaintenance';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('properties');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('properties'); // Switch back to properties tab after success
  };

  return (
    <div className="dashboard-container" style={{background: 'var(--bg-primary)', minHeight: '100vh'}}>
      <Navbar />
      <div className="premium-container">
        <div className="dashboard-header" style={{
          textAlign: 'center',
          marginBottom: '3rem',
          padding: '4rem 0 2rem'
        }}>
          <h1 className="dashboard-title" style={{
            fontSize: '3rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            background: 'var(--gradient-hero)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Owner Dashboard</h1>
          <p className="dashboard-subtitle" style={{
            fontSize: '1.3rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Welcome back! Manage your properties and track your rentals.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid-premium" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          {[
            { icon: '🏠', number: '5', label: 'Total Properties' },
            { icon: '✅', number: '3', label: 'Available' },
            { icon: '👥', number: '2', label: 'Occupied' }
          ].map((stat, index) => (
            <div key={index} className="stat-card-premium" style={{
              background: 'var(--bg-card)',
              padding: '2.5rem 2rem',
              borderRadius: '20px',
              textAlign: 'center',
              border: '1px solid rgba(90, 122, 110, 0.1)',
              transition: 'all 0.3s ease',
              boxShadow: 'var(--shadow-md)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            >
              <div className="stat-icon-premium" style={{
                fontSize: '3rem',
                marginBottom: '1.5rem',
                filter: 'drop-shadow(0 4px 12px rgba(90, 122, 110, 0.3))'
              }}>{stat.icon}</div>
              <div className="stat-number-premium" style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                background: 'var(--gradient-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>{stat.number}</div>
              <div className="stat-label-premium" style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs" style={{
          marginBottom: '3rem',
          background: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid rgba(90, 122, 110, 0.1)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden'
        }}>
          <div className="tab-list" style={{
            display: 'flex',
            background: 'rgba(90, 122, 110, 0.05)',
            borderBottom: '1px solid rgba(90, 122, 110, 0.1)'
          }}>
            {[
              { key: 'properties', label: 'My Properties & Units' },
              { key: 'addProperty', label: 'Add New Property' },
              { key: 'addUnit', label: 'Add New Unit' },
              { key: 'applications', label: 'Applications' },
              { key: 'leases', label: 'Leases & Agreements' },
              { key: 'maintenanceTicket', label: 'Maintenance Tickets' }


            ].map((tab) => (
              <button 
                key={tab.key}
                className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  padding: '1.5rem 2rem',
                  background: activeTab === tab.key ? 'var(--primary-gradient)' : 'transparent',
                  color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.target.style.background = 'rgba(90, 122, 110, 0.1)';
                    e.target.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    height: '3px',
                    background: 'white',
                    borderRadius: '2px'
                  }}></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content" style={{
          background: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid rgba(90, 122, 110, 0.1)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          minHeight: '500px'
        }}>
          {activeTab === 'properties' && <PropertyList key={refreshKey} />}
          {activeTab === 'addProperty' && <AddProperty onSuccess={handleSuccess} />}
          {activeTab === 'addUnit' && <AddUnit onSuccess={handleSuccess} />}
          {activeTab === 'applications' && <OwnerApplications />} 
          {activeTab === 'leases' && <OwnerLeaseForm />} 
          {activeTab === 'maintenanceTicket' && <OwnerMaintenance />}
        </div>
      </div>
      <Footer />

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .dashboard-title {
          animation: gradientShift 5s ease infinite;
          background-size: 200% 200%;
        }
      `}</style>
    </div>
  );
};

export default OwnerDashboard;
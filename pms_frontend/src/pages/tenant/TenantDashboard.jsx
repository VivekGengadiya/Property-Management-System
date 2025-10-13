import React from 'react';
import PropertySearch from './PropertySearch';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const TenantDashboard = () => {
  return (
    <div className="dashboard-container">
      <Header />
      <div className="premium-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Tenant Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome! Find your perfect rental property.
          </p>
        </div>

        <div className="stats-grid-premium">
          <div className="stat-card-premium">
            <div className="stat-icon-premium">📝</div>
            <div className="stat-number-premium">2</div>
            <div className="stat-label-premium">Active Rentals</div>
          </div>
          
          <div className="stat-card-premium">
            <div className="stat-icon-premium">🔍</div>
            <div className="stat-number-premium">15</div>
            <div className="stat-label-premium">Available Properties</div>
          </div>
          
          <div className="stat-card-premium">
            <div className="stat-icon-premium">🏙️</div>
            <div className="stat-number-premium">8</div>
            <div className="stat-label-premium">Cities</div>
          </div>
        </div>

        <PropertySearch />
      </div>
      <Footer />
    </div>
  );
};

export default TenantDashboard;
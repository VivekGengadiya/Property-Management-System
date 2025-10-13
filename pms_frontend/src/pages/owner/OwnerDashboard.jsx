import React, { useState } from 'react';
import PropertyList from './PropertyList';
import AddProperty from './AddProperty';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('properties');

  return (
    <div className="dashboard-container">
      <Header />
      <div className="premium-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Owner Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back! Manage your properties and track your rentals.
          </p>
        </div>

        <div className="stats-grid-premium">
          <div className="stat-card-premium">
            <div className="stat-icon-premium">🏠</div>
            <div className="stat-number-premium">5</div>
            <div className="stat-label-premium">Total Properties</div>
          </div>
          
          <div className="stat-card-premium">
            <div className="stat-icon-premium">✅</div>
            <div className="stat-number-premium">3</div>
            <div className="stat-label-premium">Available</div>
          </div>
          
          <div className="stat-card-premium">
            <div className="stat-icon-premium">👥</div>
            <div className="stat-number-premium">2</div>
            <div className="stat-label-premium">Occupied</div>
          </div>
        </div>

        <div className="tabs">
          <div className="tab-list">
            <button 
              className={`tab ${activeTab === 'properties' ? 'active' : ''}`}
              onClick={() => setActiveTab('properties')}
            >
              My Properties
            </button>
            <button 
              className={`tab ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')}
            >
              Add New Property
            </button>
          </div>
        </div>

        <div className="tab-content">
          {activeTab === 'properties' && <PropertyList />}
          {activeTab === 'add' && <AddProperty />}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OwnerDashboard;
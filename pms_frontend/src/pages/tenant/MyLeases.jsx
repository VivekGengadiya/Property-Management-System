import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar.jsx";
import Footer from "../../components/common/Footer.jsx";
import "../../styles/index.css";
import { apiCall } from "../../services/api.js";

const MyLeases = () => {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const Badge = ({ children, variant = "default" }) => {
    return <span className={`badge badge-${variant}`}>{children}</span>;
  };

  const Button = ({ children, variant = "default", size = "default", ...props }) => {
    return (
      <button className={`btn btn-${variant} btn-${size}`} {...props}>
        {children}
      </button>
    );
  };

  const Separator = () => <div className="separator" />;

  const fetchLeases = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const data = await apiCall(`/leases/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (data.success) setLeases(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Not set";

  const getStatusStyles = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending";
      case "ACTIVE":
        return "status-active";
      case "REJECTED":
      case "TERMINATED":
        return "status-rejected";
      default:
        return "status-default";
    }
  };

  if (loading) {
    return (
      <div className="leases-loading">
        <div className="loader"></div>
        <p>Loading your leases...</p>
      </div>
    );
  }

  return (
    <div className="leases-wrapper">
      <Navbar/>
      <div className="leases-container">
        <div className="leases-header">
          <div className="header-icon">📄</div>
          <h1>My Leases</h1>
          <p>Manage and review all your rental agreements</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{leases.length}</div>
            <div className="stat-label">Total Leases</div>
          </div>

          <div className="stat-card">
            <div className="stat-value green">
              {leases.filter((l) => l.status === "ACTIVE").length}
            </div>
            <div className="stat-label">Active</div>
          </div>

          <div className="stat-card">
            <div className="stat-value yellow">
              {leases.filter((l) => l.status === "PENDING").length}
            </div>
            <div className="stat-label">Pending</div>
          </div>

          <div className="stat-card">
            <div className="stat-value blue">
              {leases.filter((l) => ["ACTIVE", "PENDING"].includes(l.status)).length}
            </div>
            <div className="stat-label">Actionable</div>
          </div>
        </div>

        {/* Empty State */}
        {leases.length === 0 ? (
          <div className="empty-box">
            <div className="empty-icon">📄</div>
            <h3>No Leases Found</h3>
            <p>
              You don't have any lease agreements yet. When a landlord approves your
              application, the lease will appear here.
            </p>

            <div className="empty-actions">
              <Button>
                <Link to="/tenant/properties">➕ Browse Properties</Link>
              </Button>

              <Button variant="outline">
                <Link to="/tenant/applications">View Applications</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="lease-grid">
            {leases.map((lease) => {
              const { unitId: unit, status } = lease;
              const property = unit?.propertyId;

              return (
                <div className="lease-card" key={lease._id}>
                  <div className="lease-top">
                    <div className={`status-icon ${getStatusStyles(status)}`}>
                      {status === "PENDING" && "⏰"}
                      {status === "ACTIVE" && "✅"}
                      {status === "REJECTED" && "❌"}
                    </div>

                    <div>
                      <h3>
                        {property?.name || "Unknown"} — Unit {unit?.unitNumber || "N/A"}
                      </h3>
                      <p>📍 {property?.address?.street || "Address unavailable"}</p>
                    </div>

                    <div className="lease-actions">
                      <Badge variant={getStatusStyles(status)}>{status}</Badge>

                      <Button size="sm">
                        <Link to={`/tenant/lease/${lease._id}`}>👁️ View Details</Link>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="lease-details">
                    <div>
                      💰 <span>Monthly Rent</span>
                      <strong>{formatCurrency(lease.rentAmount)}</strong>
                    </div>

                    <div>
                      📅 <span>Lease Term</span>
                      <strong>
                        {formatDate(lease.startDate)} – {formatDate(lease.endDate)}
                      </strong>
                    </div>

                    <div>
                      🏠 <span>Unit Type</span>
                      <strong>{unit?.type || "N/A"}</strong>
                    </div>

                    <div>
                      📄 <span>Due Date</span>
                      <strong>{lease.dueDay || 1}st of month</strong>
                    </div>
                  </div>

                  {status === "PENDING" && (
                    <div className="alert-warning">
                      ⏰ <div>Action Required — Please review this lease.</div>
                    </div>
                  )}

                  {status === "ACTIVE" && (
                    <div className="alert-success">
                      ✅ <div>Your lease is active. Rent due on {lease.dueDay || 1}st.</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLeases;

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar.jsx";
import Footer from "../../components/common/Footer.jsx";
import { apiCall } from "../../services/api.js";

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log(property);

  useEffect(() => {
    fetchPropertyDetail();
    fetchPropertyUnits();
  }, [id]);

 const fetchPropertyDetail = async () => {
  try {
    const token = localStorage.getItem("token");

    const data = await apiCall(`/properties/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Property response:", data);

    if (data.success) {
      setProperty(data.data);
    } else {
      setError(data.message || "Failed to load property details");
    }

  } catch (err) {
    setError("Failed to load property details");
    console.error("Error fetching property:", err);
  }
};

  const fetchPropertyUnits = async () => {
  try {
    const token = localStorage.getItem("token");

    const data = await apiCall(`/units?propertyId=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Units response:", data);

    if (data.success) {
      setUnits(data.data || []);
    } else {
      setError(data.message || "Failed to load units");
    }

    setLoading(false);

  } catch (err) {
    setError("Failed to load units");
    console.error("Error fetching units:", err);
    setLoading(false);
  }
};


  const getPropertyImage = (imgPath) => {
    if (imgPath) {
      return `http://localhost:9000${imgPath}`;
    }
    return "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  };

  if (loading) {
    return (
      <div
        className="dashboard-container"
        style={{ background: "var(--bg-primary)", minHeight: "100vh" }}
      >
        <Navbar />
        <div className="premium-container">
          <div
            className="loading-spinner"
            style={{ textAlign: "center", padding: "4rem" }}
          >
            <div
              className="loading-spinner-premium"
              style={{
                width: "60px",
                height: "60px",
                margin: "0 auto 2rem",
                border: "4px solid rgba(102, 126, 234, 0.2)",
                borderTop: "4px solid var(--primary-light)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p style={{ color: "var(--text-secondary)" }}>
              Loading property details...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div
        className="dashboard-container"
        style={{ background: "var(--bg-primary)", minHeight: "100vh" }}
      >
        <Navbar />
        <div className="premium-container">
          <div
            className="empty-state"
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
              background: "var(--bg-card)",
              borderRadius: "20px",
              border: "1px solid rgba(102, 126, 234, 0.1)",
              marginTop: "2rem",
            }}
          >
            <div
              className="empty-state-icon"
              style={{
                fontSize: "5rem",
                marginBottom: "1.5rem",
                filter: "drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))",
              }}
            >
              ❌
            </div>
            <h3
              style={{
                fontSize: "1.75rem",
                color: "var(--text-primary)",
                marginBottom: "1rem",
                fontWeight: "700",
              }}
            >
              Property Not Found
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "2.5rem",
                fontSize: "1.1rem",
              }}
            >
              The property you're looking for doesn't exist.
            </p>
            <Link
              to="/tenant/dashboard"
              className="btn-premium btn-primary"
              style={{
                display: "inline-block",
                padding: "1rem 2rem",
                background: "var(--primary-gradient)",
                color: "white",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: "600",
                boxShadow: "var(--shadow-md)",
                transition: "all 0.3s ease",
              }}
            >
              Back to Properties
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const availableUnits = units.filter((unit) => unit.status === "AVAILABLE");
  const minRent =
    availableUnits.length > 0
      ? Math.min(...availableUnits.map((unit) => unit.rentAmount || 0))
      : 0;

  return (
    <div
      className="dashboard-container"
      style={{ background: "var(--bg-primary)", minHeight: "100vh" }}
    >
      <Navbar />
      <div
        className="premium-container"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}
      >
        {/* Property Header */}
        <div
          className="property-detail-header"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
            marginBottom: "4rem",
            alignItems: "start",
            padding: "2rem 0",
          }}
        >
          <div className="property-detail-images">
            <img
              src={getPropertyImage(property.images && property.images[0])}
              alt={property.name}
              className="property-main-image"
              style={{
                width: "100%",
                height: "450px",
                objectFit: "cover",
                borderRadius: "24px",
                boxShadow: "var(--shadow-lg)",
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
              }}
            />
          </div>

          <div className="property-detail-info" style={{ padding: "1rem 0" }}>
            <div
              className="property-badge large"
              style={{
                display: "inline-block",
                background: "var(--primary-gradient)",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "600",
                marginBottom: "1.5rem",
                boxShadow: "var(--shadow-md)",
              }}
            >
              {property.propertyType}
            </div>

            <h1
              className="property-detail-title"
              style={{
                fontSize: "3rem",
                fontWeight: "800",
                color: "var(--text-primary)",
                marginBottom: "1rem",
                lineHeight: "1.2",
                background: "var(--gradient-hero)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {property.name}
            </h1>

            <div
              className="property-detail-price"
              style={{
                fontSize: "2.5rem",
                fontWeight: "800",
                background: "var(--gradient-hero)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "2rem",
              }}
            >
              ${minRent || "N/A"}
              <span
                style={{
                  fontSize: "1.2rem",
                  color: "var(--text-muted)",
                  fontWeight: "500",
                  marginLeft: "0.5rem",
                }}
              >
                /month starting from
              </span>
            </div>

            <div
              className="property-detail-stats"
              style={{
                display: "flex",
                gap: "3rem",
                marginBottom: "2.5rem",
                padding: "1.5rem",
                background: "rgba(102, 126, 234, 0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(102, 126, 234, 0.1)",
              }}
            >
              <div className="stat" style={{ textAlign: "center" }}>
                <div
                  className="stat-number"
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "800",
                    color: "var(--accent-teal)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {availableUnits.length}
                </div>
                <div
                  className="stat-label"
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Available Units
                </div>
              </div>
            </div>

            <div
              className="property-description-preview"
              style={{
                color: "var(--text-secondary)",
                lineHeight: "1.7",
                fontSize: "1.2rem",
                padding: "1.5rem",
                background: "var(--bg-card)",
                borderRadius: "16px",
                border: "1px solid rgba(102, 126, 234, 0.1)",
              }}
            >
              {property.description ||
                "A beautiful property in a great location with modern amenities and convenient access to local facilities."}
            </div>
          </div>
        </div>

        {/* Property Description */}
        <div
          className="property-detail-section"
          style={{
            background: "var(--bg-card)",
            padding: "2.5rem",
            borderRadius: "20px",
            boxShadow: "var(--shadow-lg)",
            marginBottom: "2.5rem",
            border: "1px solid rgba(102, 126, 234, 0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "1.5rem",
              background: "var(--gradient-hero)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Property Description
          </h2>
          <p
            className="property-description"
            style={{
              color: "var(--text-secondary)",
              lineHeight: "1.8",
              fontSize: "1.1rem",
            }}
          >
            {property.description ||
              "No description available for this property."}
          </p>
        </div>

        {/* Available Units */}
        <div
          className="property-detail-section"
          style={{
            background: "var(--bg-card)",
            padding: "2.5rem",
            borderRadius: "20px",
            boxShadow: "var(--shadow-lg)",
            marginBottom: "2.5rem",
            border: "1px solid rgba(102, 126, 234, 0.1)",
          }}
        >
          <div style={{ marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "var(--text-primary)",
                marginBottom: "0.75rem",
                background: "var(--gradient-hero)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Available Units
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1.1rem",
              }}
            >
              Browse through all available units in this property
            </p>
          </div>

          {availableUnits.length === 0 ? (
            <div
              className="empty-state"
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                background: "rgba(102, 126, 234, 0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(102, 126, 234, 0.1)",
              }}
            >
              <div
                className="empty-state-icon"
                style={{
                  fontSize: "4rem",
                  marginBottom: "1.5rem",
                  filter: "drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))",
                }}
              >
                🏠
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  color: "var(--text-primary)",
                  marginBottom: "1rem",
                  fontWeight: "700",
                }}
              >
                No Units Available
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "1.1rem",
                }}
              >
                All units in this property are currently occupied.
              </p>
            </div>
          ) : (
            <div
              className="units-grid detailed"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                gap: "2rem",
              }}
            >
              {availableUnits.map((unit) => (
                <div
                  key={unit._id}
                  className="unit-card detailed"
                  style={{
                    background: "var(--bg-secondary)",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-md)",
                    border: "1px solid rgba(102, 126, 234, 0.1)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-glow)";
                    e.currentTarget.style.borderColor =
                      "rgba(102, 126, 234, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    e.currentTarget.style.borderColor =
                      "rgba(102, 126, 234, 0.1)";
                  }}
                >
                  <div
                    className="unit-image-container"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      height: "220px",
                    }}
                  >
                    <img
                      src={getPropertyImage(unit.images && unit.images[0])}
                      alt={`Unit ${unit.unitNumber}`}
                      className="unit-image"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.4s ease",
                      }}
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                    <div
                      className="unit-badge"
                      style={{
                        position: "absolute",
                        top: "1rem",
                        left: "1rem",
                        background: "var(--accent-teal)",
                        color: "white",
                        padding: "0.5rem 1.5rem",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        boxShadow: "var(--shadow-md)",
                      }}
                    >
                      Unit {unit.unitNumber}
                    </div>
                  </div>

                  <div className="unit-content" style={{ padding: "2rem" }}>
                    <div
                      className="unit-header"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <h3
                        className="unit-title"
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: "700",
                          color: "var(--text-primary)",
                        }}
                      >
                        Unit {unit.unitNumber}
                      </h3>
                      <div
                        className="unit-price"
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: "800",
                          color: "var(--accent-teal)",
                        }}
                      >
                        ${unit.rentAmount}/month
                      </div>
                    </div>

                    <div
                      className="unit-details"
                      style={{
                        display: "grid",
                        gap: "1rem",
                        marginBottom: "2rem",
                      }}
                    >
                      <div
                        className="unit-detail"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.75rem",
                          background: "rgba(102, 126, 234, 0.05)",
                          borderRadius: "12px",
                          border: "1px solid rgba(102, 126, 234, 0.1)",
                        }}
                      >
                        <strong style={{ color: "var(--text-primary)" }}>
                          Status:
                        </strong>
                        <span
                          style={{
                            color: "var(--accent-teal)",
                            fontWeight: "600",
                            background: "rgba(20, 184, 166, 0.1)",
                            padding: "0.5rem 1rem",
                            borderRadius: "12px",
                            fontSize: "0.8rem",
                          }}
                        >
                          {unit.status}
                        </span>
                      </div>

                      {unit.bedrooms && (
                        <div
                          className="unit-detail"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "0.75rem",
                            background: "rgba(102, 126, 234, 0.05)",
                            borderRadius: "12px",
                            border: "1px solid rgba(102, 126, 234, 0.1)",
                          }}
                        >
                          <strong style={{ color: "var(--text-primary)" }}>
                            Bedrooms:
                          </strong>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {unit.bedrooms}
                          </span>
                        </div>
                      )}

                      {unit.bathrooms && (
                        <div
                          className="unit-detail"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "0.75rem",
                            background: "rgba(102, 126, 234, 0.05)",
                            borderRadius: "12px",
                            border: "1px solid rgba(102, 126, 234, 0.1)",
                          }}
                        >
                          <strong style={{ color: "var(--text-primary)" }}>
                            Bathrooms:
                          </strong>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {unit.bathrooms}
                          </span>
                        </div>
                      )}

                      {unit.sqft && (
                        <div
                          className="unit-detail"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "0.75rem",
                            background: "rgba(102, 126, 234, 0.05)",
                            borderRadius: "12px",
                            border: "1px solid rgba(102, 126, 234, 0.1)",
                          }}
                        >
                          <strong style={{ color: "var(--text-primary)" }}>
                            Square Feet:
                          </strong>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {unit.sqft} sqft
                          </span>
                        </div>
                      )}

                      <div
                        className="unit-detail"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.75rem",
                          background: "rgba(102, 126, 234, 0.05)",
                          borderRadius: "12px",
                          border: "1px solid rgba(102, 126, 234, 0.1)",
                        }}
                      >
                        <strong style={{ color: "var(--text-primary)" }}>
                          Security Deposit:
                        </strong>
                        <span style={{ color: "var(--text-secondary)" }}>
                          ${unit.depositAmount || unit.rentAmount}
                        </span>
                      </div>
                    </div>

                    <div className="unit-actions">
                      <Link
                        to={`/unit/${unit._id}`}
                        className="btn-premium btn-primary"
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "center",
                          padding: "1rem 2rem",
                          background: "var(--primary-gradient)",
                          color: "white",
                          borderRadius: "12px",
                          textDecoration: "none",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                          boxShadow: "var(--shadow-md)",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "1rem",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "var(--shadow-glow)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "var(--shadow-md)";
                        }}
                      >
                        View Details & Apply
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div
          className="property-detail-section"
          style={{
            background: "var(--bg-card)",
            padding: "3rem",
            borderRadius: "20px",
            boxShadow: "var(--shadow-lg)",
            marginBottom: "3rem",
            textAlign: "center",
            border: "1px solid rgba(102, 126, 234, 0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "1.5rem",
              background: "var(--gradient-hero)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Contact Information
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: "2.5rem",
              fontSize: "1.2rem",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            For more information about this property or to schedule a viewing,
            please contact the property manager.
          </p>
          <div
            className="contact-actions"
            style={{
              display: "flex",
              gap: "1.5rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn-premium btn-primary"
              style={{
                padding: "1rem 2rem",
                background: "var(--primary-gradient)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                transition: "all 0.3s ease",
                boxShadow: "var(--shadow-md)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "var(--shadow-glow)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "var(--shadow-md)";
              }}
            >
              📞 Contact Property Manager
            </button>
            <button
              className="btn-premium btn-secondary"
              style={{
                padding: "1rem 2rem",
                background: "rgba(102, 126, 234, 0.1)",
                color: "var(--text-primary)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                borderRadius: "12px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(102, 126, 234, 0.2)";
                e.target.style.borderColor = "rgba(102, 126, 234, 0.5)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(102, 126, 234, 0.1)";
                e.target.style.borderColor = "rgba(102, 126, 234, 0.3)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              📧 Send Email
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PropertyDetail;

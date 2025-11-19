import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTickets } from "../../context/TicketsContext";
import StatusBadge from "../../components/ui/StatusBadge";
import PriorityBadge from "../../components/ui/PriorityBadge";
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 14, padding: "0.75rem 0", borderBottom: "1px solid #f3f4f6" }}>
      <div style={{ color: "#6b7280", minWidth: 120, fontWeight: "500" }}>{label}:</div>
      <div style={{ color: "#374151", fontWeight: "500" }}>{children}</div>
    </div>
  );
}

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { get, updateStatus, addNote } = useTickets();
  const t = get(id);

  const [note, setNote] = React.useState("");

  if (!t) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="premium-container">
          <div className="empty-state" style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#f9fafb',
            borderRadius: '12px'
          }}>
            <div className="empty-state-icon" style={{fontSize: '4rem', marginBottom: '1rem'}}>❌</div>
            <h3 style={{fontSize: '1.5rem', color: '#1f2937', marginBottom: '1rem'}}>Ticket Not Found</h3>
            <p style={{color: '#6b7280', marginBottom: '2rem'}}>The ticket you're looking for doesn't exist.</p>
            <button 
              onClick={() => navigate(-1)} 
              className="btn-premium btn-primary"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header />
      <div className="premium-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header with Back Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to="/staff/assigned"
            style={{
              textDecoration: "none",
              color: "#3b82f6",
              fontWeight: "500",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              background: "#f0f9ff",
              border: "1px solid #e0f2fe",
              marginBottom: "1rem"
            }}
          >
            ← Back to Assigned Tickets
          </Link>
          
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
            marginBottom: "1.5rem"
          }}>
            <div>
              <h1 style={{ 
                fontSize: "2rem", 
                fontWeight: "700", 
                color: "#1f2937",
                marginBottom: "0.5rem"
              }}>
                {t.title}
              </h1>
              <div style={{ 
                display: "flex", 
                gap: "12px", 
                alignItems: "center",
                flexWrap: 'wrap'
              }}>
                <StatusBadge status={t.status} />
                <PriorityBadge priority={t.priority} />
                <span style={{ 
                  color: "#6b7280", 
                  fontSize: "14px",
                  background: "#f9fafb",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px"
                }}>
                  Ticket #{t.id}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: 'wrap' }}>
              {t.status !== "OPEN" && (
                <button 
                  onClick={() => updateStatus(t.id, "OPEN")} 
                  className="btn-premium btn-outline"
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #d1d5db",
                    background: "white",
                    color: "#374151",
                    borderRadius: "8px",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontSize: "0.875rem"
                  }}
                >
                  Set OPEN
                </button>
              )}
              {t.status !== "IN_PROGRESS" && (
                <button
                  onClick={() => updateStatus(t.id, "IN_PROGRESS")}
                  className="btn-premium btn-outline"
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #d1d5db",
                    background: "white",
                    color: "#374151",
                    borderRadius: "8px",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontSize: "0.875rem"
                  }}
                >
                  In Progress
                </button>
              )}
              {t.status !== "RESOLVED" && (
                <button 
                  onClick={() => updateStatus(t.id, "RESOLVED")} 
                  className="btn-premium btn-primary"
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontSize: "0.875rem"
                  }}
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ 
          display: "grid", 
          gap: "24px", 
          gridTemplateColumns: "1fr 400px"
        }}>
          {/* Left Column - Main Content */}
          <div style={{ display: "grid", gap: "24px" }}>
            {/* Description Card */}
            <div className="card-premium" style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb"
            }}>
              <h3 style={{ 
                fontWeight: "600", 
                marginBottom: "1rem",
                fontSize: "1.25rem",
                color: "#1f2937"
              }}>
                Description
              </h3>
              <div style={{ 
                color: "#374151",
                lineHeight: "1.6",
                fontSize: "1rem"
              }}>
                {t.description}
              </div>
            </div>

            {/* Attachments Card */}
            <div className="card-premium" style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb"
            }}>
              <h3 style={{ 
                fontWeight: "600", 
                marginBottom: "1rem",
                fontSize: "1.25rem",
                color: "#1f2937"
              }}>
                Attachments
              </h3>
              {t.attachments?.length ? (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: "16px"
                }}>
                  {t.attachments.map((a, i) => (
                    <a
                      key={i}
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        overflow: "hidden",
                        display: "block",
                        transition: "transform 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"}
                      onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                    >
                      <img
                        src={a.url}
                        alt={a.name || `attachment-${i}`}
                        style={{ 
                          width: "100%", 
                          height: "140px", 
                          objectFit: "cover" 
                        }}
                      />
                      <div style={{
                        padding: "0.5rem",
                        fontSize: "0.875rem",
                        color: "#6b7280",
                        textAlign: "center"
                      }}>
                        {a.name || `Attachment ${i + 1}`}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  color: "#6b7280", 
                  fontSize: "14px",
                  textAlign: "center",
                  padding: "2rem",
                  background: "#f9fafb",
                  borderRadius: "8px"
                }}>
                  No attachments available
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div style={{ display: "grid", gap: "24px" }}>
            {/* Details Card */}
            <div className="card-premium" style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb"
            }}>
              <h3 style={{ 
                fontWeight: "600", 
                marginBottom: "1rem",
                fontSize: "1.25rem",
                color: "#1f2937"
              }}>
                Ticket Details
              </h3>
              <div style={{ display: "grid" }}>
                <Row label="Category">{t.category}</Row>
                <Row label="Property">{t.propertyName}</Row>
                <Row label="Unit">{t.unitNumber}</Row>
                <Row label="Tenant">{t.tenant?.name}</Row>
                <Row label="Created">{new Date(t.createdAt).toLocaleString()}</Row>
                <Row label="Last Updated">{new Date(t.updatedAt).toLocaleString()}</Row>
              </div>
            </div>

            {/* Add Note Card */}
            <div className="card-premium" style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb"
            }}>
              <h3 style={{ 
                fontWeight: "600", 
                marginBottom: "1rem",
                fontSize: "1.25rem",
                color: "#1f2937"
              }}>
                Add Note
              </h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Type a note…"
                  style={{ 
                    flex: 1,
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.875rem"
                  }}
                />
                <button
                  onClick={() => {
                    const v = note.trim();
                    if (!v) return;
                    addNote(t.id, v);
                    setNote("");
                  }}
                  className="btn-premium btn-primary"
                  style={{
                    padding: "0.75rem 1rem",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "500",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  Add Note
                </button>
              </div>
            </div>

            {/* Activity Card */}
            <div className="card-premium" style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb"
            }}>
              <h3 style={{ 
                fontWeight: "600", 
                marginBottom: "1rem",
                fontSize: "1.25rem",
                color: "#1f2937"
              }}>
                Activity Log
              </h3>
              {t.activity?.length ? (
                <div style={{ display: "grid", gap: "12px", maxHeight: "400px", overflowY: "auto" }}>
                  {t.activity
                    .slice()
                    .sort((a, b) => b.at - a.at)
                    .map((a, i) => (
                      <div
                        key={i}
                        style={{
                          border: "1px solid #f3f4f6",
                          borderRadius: "8px",
                          padding: "12px",
                          background: "#f9fafb"
                        }}
                      >
                        <div style={{ 
                          color: "#6b7280", 
                          fontSize: "12px",
                          marginBottom: "4px"
                        }}>
                          {new Date(a.at).toLocaleString()} — {a.by}
                        </div>
                        <div style={{ fontSize: "14px" }}>
                          <strong style={{ color: "#1f2937" }}>{a.action}</strong>
                          {a.note ? `: ${a.note}` : ""}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div style={{ 
                  color: "#6b7280", 
                  fontSize: "14px",
                  textAlign: "center",
                  padding: "2rem",
                  background: "#f9fafb",
                  borderRadius: "8px"
                }}>
                  No activity recorded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
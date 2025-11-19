import React from "react";
import { Link } from "react-router-dom";
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useTickets } from "../../context/TicketsContext";
import StatusBadge from "../../components/ui/StatusBadge";
import PriorityBadge from "../../components/ui/PriorityBadge";

export default function AssignedTickets() {
  const { listAssigned, updateStatus } = useTickets();
  const [status, setStatus] = React.useState("");
  const [priority, setPriority] = React.useState("");
  const [search, setSearch] = React.useState("");

  const rows = React.useMemo(
    () =>
      listAssigned({
        status: status || undefined,
        priority: priority || undefined,
        search,
      }),
    [listAssigned, status, priority, search]
  );

  return (
    <div className="dashboard-container">
      <Header />
      <div className="premium-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Assigned Tickets
          </h1>
          <p style={{ 
            color: '#6b7280',
            fontSize: '1.125rem'
          }}>
            Manage and track all tickets assigned to you
          </p>
        </div>

        {/* Filters Card */}
        <div className="card-premium" style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          marginBottom: "1.5rem"
        }}>
          <div style={{ 
            display: "flex", 
            gap: "1rem", 
            alignItems: "center",
            flexWrap: "wrap" 
          }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <label style={{ 
                fontSize: "0.875rem", 
                fontWeight: "500",
                color: "#374151",
                minWidth: "60px"
              }}>
                Status:
              </label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  minWidth: "140px"
                }}
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <label style={{ 
                fontSize: "0.875rem", 
                fontWeight: "500",
                color: "#374151",
                minWidth: "60px"
              }}>
                Priority:
              </label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  minWidth: "140px"
                }}
              >
                <option value="">Any Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: "250px" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, description, or tenant..."
                style={{
                  width: "100%",
                  padding: "0.5rem 1rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            <div style={{ 
              fontSize: "0.875rem", 
              color: "#6b7280",
              background: "#f3f4f6",
              padding: "0.5rem 1rem",
              borderRadius: "20px"
            }}>
              {rows.length} ticket{rows.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div style={{ display: "grid", gap: "1rem" }}>
          {rows.length === 0 ? (
            <div className="card-premium" style={{
              textAlign: "center", 
              color: "#6b7280",
              padding: "3rem 2rem",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
              <h3 style={{ color: "#374151", marginBottom: "0.5rem" }}>No Tickets Found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            rows.map((t) => (
              <div
                key={t.id}
                className="card-premium"
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e5e7eb",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1)";
                }}
              >
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start",
                  gap: "1rem"
                }}>
                  {/* Ticket Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.75rem",
                      marginBottom: "0.75rem",
                      flexWrap: "wrap"
                    }}>
                      <h3 style={{ 
                        fontWeight: "600", 
                        fontSize: "1.125rem",
                        color: "#1f2937",
                        margin: 0
                      }}>
                        {t.title}
                      </h3>
                      <StatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                    </div>
                    
                    <p style={{ 
                      fontSize: "0.875rem", 
                      color: "#4b5563",
                      lineHeight: "1.5",
                      marginBottom: "0.75rem"
                    }}>
                      {t.description}
                    </p>
                    
                    <div style={{ 
                      display: "flex", 
                      gap: "1rem",
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      flexWrap: "wrap"
                    }}>
                      <span>Property: {t.propertyName}</span>
                      <span>Unit: {t.unitNumber}</span>
                      <span>Tenant: {t.tenant?.name}</span>
                      <span>Updated: {new Date(t.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ 
                    display: "flex", 
                    gap: "0.5rem", 
                    flexShrink: 0,
                    flexWrap: "wrap"
                  }}>
                    {/* Status Quick Actions */}
                    {t.status !== "OPEN" && (
                      <button
                        onClick={() => updateStatus(t.id, "OPEN")}
                        className="btn-premium btn-outline"
                        style={{
                          padding: "0.5rem 0.75rem",
                          border: "1px solid #d1d5db",
                          background: "white",
                          color: "#374151",
                          borderRadius: "6px",
                          fontWeight: "500",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          whiteSpace: "nowrap"
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
                          padding: "0.5rem 0.75rem",
                          border: "1px solid #d1d5db",
                          background: "white",
                          color: "#374151",
                          borderRadius: "6px",
                          fontWeight: "500",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          whiteSpace: "nowrap"
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
                          padding: "0.5rem 0.75rem",
                          background: "#059669",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontWeight: "500",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          whiteSpace: "nowrap"
                        }}
                      >
                        Resolve
                      </button>
                    )}

                    {/* View Button */}
                    <Link
                      to={`/staff/assigned/${t.id}`}
                      className="btn-premium btn-primary"
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "500",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
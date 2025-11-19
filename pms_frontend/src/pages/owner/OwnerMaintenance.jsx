import React, { useEffect, useState } from "react";
import axios from "axios";
import TicketDetailModal from "../../components/modals/TicketDetailModal";
import AssignStaffModal from "../../components/modals/AssignStaffModal";

const OwnerMaintenance = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch all tickets for landlord
  const loadTickets = async () => {
    try {
      const res = await axios.get("/api/maintenance/landlord", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data.data || []);
    } catch (error) {
      console.error("Error fetching maintenance tickets:", error);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Close ticket
  const closeTicket = async (id) => {
    try {
      await axios.put(
        `/api/maintenance/${id}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadTickets();
    } catch (error) {
      console.error("Close ticket error:", error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "800",
          marginBottom: "2rem",
          background: "var(--gradient-hero)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Maintenance Tickets
      </h2>

      {/* Table */}
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "20px",
          padding: "1.5rem",
          boxShadow: "var(--shadow-md)",
          border: "1px solid rgba(90, 122, 110, 0.1)",
        }}
      >
        <table className="maintenance-table" style={{ width: "100%" }}>
          <thead>
            <tr style={{ background: "rgba(90, 122, 110, 0.08)" }}>
              {[
                "Property",
                "Unit",
                "Title",
                "Category",
                "Priority",
                "Status",
                "Assigned To",
                "Actions",
              ].map((head, i) => (
                <th
                  key={i}
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "var(--text-secondary)",
                  }}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {tickets.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  style={{ padding: "2rem", textAlign: "center", opacity: 0.5 }}
                >
                  No maintenance tickets found.
                </td>
              </tr>
            )}

            {tickets.map((t) => (
              <tr key={t._id} style={{ borderBottom: "1px solid #eee" }}>
                {/* Property Name */}
                <td style={{ padding: "1rem" }}>
                  {t.unitId?.propertyId?.name || "Unknown Property"}
                </td>

                {/* Unit Number */}
                <td style={{ padding: "1rem" }}>{t.unitId?.unitNumber}</td>

                <td style={{ padding: "1rem" }}>{t.title}</td>
                <td style={{ padding: "1rem" }}>{t.category}</td>
                <td style={{ padding: "1rem" }}>{t.priority}</td>
                <td style={{ padding: "1rem" }}>{t.status}</td>
                <td style={{ padding: "1rem" }}>
                  {t.assignedTo?.name || "Unassigned"}
                </td>

                <td style={{ padding: "1rem" }}>
                  <button
                    onClick={() => setSelectedTicket(t)}
                    className="btn-view"
                    style={{
                      padding: "0.4rem 0.7rem",
                      background: "var(--primary)",
                      borderRadius: "8px",
                      marginRight: "0.5rem",
                    }}
                  >
                    View
                  </button>

                  {!["RESOLVED", "CLOSED"].includes(t.status) && (
                    <button
                      onClick={() => {
                        setSelectedTicket(t);
                        setAssignModalOpen(true);
                      }}
                      className="btn-assign"
                      style={{
                        padding: "0.4rem 0.7rem",
                        background: "green",
                        color: "white",
                        borderRadius: "8px",
                        marginRight: "0.5rem",
                      }}
                    >
                      Assign
                    </button>
                  )}

                  <button
                    disabled={t.status !== "RESOLVED"}
                    onClick={() => closeTicket(t._id)}
                    className="btn-close"
                    style={{
                      padding: "0.4rem 0.7rem",
                      background:
                        t.status === "RESOLVED"
                          ? "crimson"
                          : "rgba(220, 20, 60, 0.4)",
                      color: "white",
                      borderRadius: "8px",
                      cursor:
                        t.status === "RESOLVED" ? "pointer" : "not-allowed",
                    }}
                  >
                    Close
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Ticket Modal */}
      {selectedTicket && !assignModalOpen && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {/* Assign Modal */}
      {assignModalOpen && (
        <AssignStaffModal
          ticket={selectedTicket}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedTicket(null);
            loadTickets();
          }}
          token={token}
        />
      )}
    </div>
  );
};

export default OwnerMaintenance;

import React, { useState, useEffect } from "react";
import axios from "axios";

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backdropFilter: "blur(3px)",
  zIndex: 9999,
};

const modalBox = {
  background: "var(--bg-card)",
  padding: "2rem",
  borderRadius: "20px",
  width: "420px",
  boxShadow: "var(--shadow-lg)",
  border: "1px solid rgba(90, 122, 110, 0.15)",
};

export default function AssignStaffModal({ ticket, token, onClose }) {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");

  // Check if ticket is resolved
  const isResolved = ticket?.status === "RESOLVED";

  // Fetch MAINTENANCE STAFF
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const res = await axios.get("/api/users?role=MAINTENANCE", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStaffList(res.data.data || []);
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };

    loadStaff();
  }, [token]);

  const assignStaff = async () => {
    if (!selectedStaff) {
      alert("Please select a staff member");
      return;
    }

    try {
      await axios.put(
        `/api/maintenance/${ticket._id}/assign`,
        { assignedTo: selectedStaff },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onClose();
    } catch (error) {
      console.error("Assign staff error:", error);
    }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={(e) => e.stopPropagation()}>
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: "800",
            marginBottom: "1rem",
            background: "var(--gradient-hero)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Assign Staff
        </h2>

        {isResolved ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <p style={{ 
              marginBottom: "1rem", 
              opacity: 0.7,
              color: "#666",
              fontStyle: "italic"
            }}>
              This ticket has been resolved and cannot be reassigned.
            </p>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                background: "#555",
                color: "white",
                padding: "0.7rem",
                borderRadius: "12px",
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <p style={{ marginBottom: "1rem", opacity: 0.7 }}>
              Select a maintenance staff member for this ticket.
            </p>

            <label style={{ fontWeight: 600 }}>Choose Staff:</label>

            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              style={{
                width: "100%",
                padding: "0.8rem",
                margin: "0.5rem 0 1.5rem",
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.2)",
              }}
            >
              <option value="">-- Select Staff --</option>

              {staffList.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.name} ({staff.email})
                </option>
              ))}
            </select>

            <button
              onClick={assignStaff}
              style={{
                width: "100%",
                background: "green",
                color: "white",
                padding: "0.7rem",
                borderRadius: "12px",
                marginBottom: "0.7rem",
                fontWeight: 600,
              }}
            >
              Assign
            </button>

            <button
              onClick={onClose}
              style={{
                width: "100%",
                background: "#555",
                color: "white",
                padding: "0.7rem",
                borderRadius: "12px",
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
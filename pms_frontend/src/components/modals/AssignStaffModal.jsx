import React, { useState, useEffect } from "react";

import { usersAPI } from "../../services/api";

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

  const isResolved = ticket?.status === "RESOLVED";
  const isAssigned = Boolean(ticket?.assignedTo); // NEW: check if someone is already assigned

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const res = await usersAPI.getUsersByRole("MAINTENANCE");

        console.log("Staff API response:", res);

        // Some APIs return res.data, some return {data: [...]}
        setStaffList(res.data?.data || res.data || []);
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
    const response = await apiCall(`/maintenance/${ticket._id}/assign`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: { assignedTo: selectedStaff }
    });

    if (response.success) {
      onClose();
    } else {
      console.error("Error assigning staff:", response.message);
      alert(response.message || "Failed to assign staff");
    }

  } catch (error) {
    console.error("Assign staff error:", error);
    alert("Error assigning staff");
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

        {/* If ticket is resolved - block assignment */}
        {isResolved ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <p
              style={{
                marginBottom: "1rem",
                opacity: 0.7,
                color: "#666",
                fontStyle: "italic",
              }}
            >
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
            {/* If ticket is already assigned */}
            {isAssigned ? (
              <p
                style={{
                  marginBottom: "1rem",
                  opacity: 0.9,
                  color: "crimson",
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                This ticket is already assigned to:
                <br />
                <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                  {ticket.assignedTo?.name || "Staff Member"}
                </span>
              </p>
            ) : (
              <p style={{ marginBottom: "1rem", opacity: 0.7 }}>
                Select a maintenance staff member for this ticket.
              </p>
            )}

            <label style={{ fontWeight: 600 }}>Choose Staff:</label>

            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              disabled={isAssigned} // NEW
              style={{
                width: "100%",
                padding: "0.8rem",
                margin: "0.5rem 0 1.5rem",
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.2)",
                background: isAssigned ? "#e5e5e5" : "white",
                cursor: isAssigned ? "not-allowed" : "pointer",
              }}
            >
              <option value="">-- Select Staff --</option>

              {staffList.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.name} ({staff.email})
                </option>
              ))}
            </select>

            {/* Assign Button */}
            <button
              onClick={assignStaff}
              disabled={isAssigned} // NEW
              style={{
                width: "100%",
                background: isAssigned ? "#999" : "green",
                color: "white",
                padding: "0.7rem",
                borderRadius: "12px",
                marginBottom: "0.7rem",
                fontWeight: 600,
                cursor: isAssigned ? "not-allowed" : "pointer",
                opacity: isAssigned ? 0.6 : 1,
              }}
            >
              Assign
            </button>

            {/* Cancel Button */}
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

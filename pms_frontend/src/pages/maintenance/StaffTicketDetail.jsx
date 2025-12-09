import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { apiCall } from "../../services/api";

const StaffTicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");

  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");

  const isUpdateMode = location.search.includes("update=true");

  const loadTicket = async () => {
  try {
    console.log("Fetching ticket details...");

    const res = await apiCall(`/maintenance/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log("Ticket API Response:", res);

    if (!res.success) {
      throw new Error(res.message || "Failed to load ticket");
    }

    setTicket(res.data);
    setStatus(res.data.status);

  } catch (error) {
    console.error("Error loading ticket:", error);
  }
};


  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleStatusUpdate = async () => {
  try {
    const res = await apiCall(`/maintenance/${id}/status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: { status, note }
    });

    if (!res.success) {
      throw new Error(res.message || "Failed to update status");
    }

    await loadTicket();
    alert("Status updated!");
    navigate(`/staff/ticket/${id}`);

  } catch (error) {
    console.error("Status update error:", error);
    alert(error.message || "Failed to update status");
  }
};

  if (!ticket)
    return (
      <p style={{ padding: "2rem", textAlign: "center", opacity: 0.6 }}>
        Loading ticket...
      </p>
    );
 console.log("Ticket CreatedAt:", ticket.createdAt);
  return (
    
    <div>
      <Navbar />

      <div className="premium-container" style={{ padding: "3rem" }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "0.7rem 1.2rem",
            background: "var(--primary)",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            marginBottom: "1.5rem",
          }}
        >
          ← Back
        </button>

        {/* Title */}
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "800",
            background: "var(--gradient-hero)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gradientShift 5s ease infinite",
            backgroundSize: "200% 200%",
            marginBottom: "2rem",
          }}
        >
          Ticket Details
        </h1>

        {/* Card Container */}
        <div
          style={{
            background: "var(--bg-card)",
            padding: "2rem",
            borderRadius: "20px",
            border: "1px solid rgba(90, 122, 110, 0.1)",
            boxShadow: "var(--shadow-lg)",
            marginBottom: "3rem",
          }}
        >

          {/* Ticket Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              marginBottom: "2rem",
            }}
          >
            <div>
              <h3 style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Title</h3>
              <p style={{ fontSize: "1.2rem" }}>{ticket.title}</p>
            </div>

            <div>
              <h3 style={{ color: "var(--text-secondary)" }}>Category</h3>
              <p style={{ fontSize: "1.2rem" }}>{ticket.category}</p>
            </div>

            <div>
              <h3 style={{ color: "var(--text-secondary)" }}>Priority</h3>
              <p style={{ fontSize: "1.2rem" }}>{ticket.priority}</p>
            </div>

            <div>
              <h3 style={{ color: "var(--text-secondary)" }}>Status</h3>
              <p style={{ fontSize: "1.2rem", fontWeight: "600" }}>{ticket.status}</p>
            </div>

            <div>
              <h3 style={{ color: "var(--text-secondary)" }}>Unit</h3>
              <p style={{ fontSize: "1.2rem" }}>{ticket.unitId?.unitNumber}</p>
            </div>

            {/* <div>
              <h3 style={{ color: "var(--text-secondary)" }}>Created At</h3>
              <p style={{ fontSize: "1.2rem" }}>
                {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div> */}
               

            <div style={{ gridColumn: "1 / -1" }}>
              <h3 style={{ color: "var(--text-secondary)" }}>Description</h3>
              <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
                {ticket.description}
              </p>
            </div>
          </div>

          {/* Attachments */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Attachments
            </h3>

            {ticket.attachments?.length === 0 && (
              <p style={{ opacity: 0.6 }}>No attachments uploaded.</p>
            )}

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {ticket.attachments?.map((file, i) => (
                <img
                  key={i}
                  src={file}
                  alt="attachment"
                  style={{
                    width: "140px",
                    height: "140px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow-sm)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Timeline
            </h3>

            {ticket.timeline.map((tl, i) => (
              <div
                key={i}
                style={{
                  padding: "1rem 0",
                  borderBottom: "1px solid rgba(0,0,0,0.07)",
                }}
              >
                <strong>{tl.action}</strong>
                <p style={{ margin: "0.3rem 0" }}>{tl.note}</p>
                <small style={{ opacity: 0.7 }}>
                  {new Date(tl.at).toLocaleString()}
                </small>
              </div>
            ))}
          </div>

          {/* Update Status Area */}
          {isUpdateMode && (
            <div
              style={{
                padding: "1.5rem",
                background: "rgba(90, 122, 110, 0.05)",
                borderRadius: "12px",
                marginTop: "2rem",
              }}
            >
              <h3 style={{ marginBottom: "1rem" }}>Update Status</h3>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  borderRadius: "10px",
                  border: "1px solid rgba(90, 122, 110, 0.3)",
                  marginBottom: "1rem",
                }}
              >
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="ON_HOLD">ON_HOLD</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>

              <textarea
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows="4"
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "10px",
                  border: "1px solid rgba(90, 122, 110, 0.3)",
                }}
              />

              <button
                onClick={handleStatusUpdate}
                style={{
                  marginTop: "1rem",
                  padding: "0.8rem 1.5rem",
                  background: "seagreen",
                  color: "white",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Update Status
              </button>
            </div>
          )}

        </div>

        {/* Gradient Animation */}
        <style >{`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      </div>

      <Footer />
    </div>
  );
};

export default StaffTicketDetail;

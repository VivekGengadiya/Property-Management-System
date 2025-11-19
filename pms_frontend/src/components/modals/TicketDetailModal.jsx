import React from "react";

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
  width: "500px",
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "var(--shadow-lg)",
  border: "1px solid rgba(90, 122, 110, 0.15)",
};

export default function TicketDetailModal({ ticket, onClose }) {
  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={(e) => e.stopPropagation()}>
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: "800",
            marginBottom: "1rem",
            background: "var(--gradient-hero)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Ticket Details
        </h2>

        <div style={{ marginBottom: "1rem" }}>
          <p><strong>Unit:</strong> {ticket.unitId?.unitNumber}</p>
          <p><strong>Title:</strong> {ticket.title}</p>
          <p><strong>Description:</strong> {ticket.description}</p>
          <p><strong>Category:</strong> {ticket.category}</p>
          <p><strong>Priority:</strong> {ticket.priority}</p>
          <p><strong>Status:</strong> {ticket.status}</p>
        </div>

        {/* Attachments */}
        {ticket.attachments?.length > 0 && (
          <>
            <h3 style={{ fontWeight: "700", marginTop: "1rem" }}>Attachments</h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "1rem",
              }}
            >
              {ticket.attachments.map((file, idx) => (
                <a
                  key={idx}
                  href={file}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#eee",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                  }}
                >
                  View File {idx + 1}
                </a>
              ))}
            </div>
          </>
        )}

        {/* Timeline */}
        <h3
          style={{
            fontWeight: "700",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          Timeline
        </h3>

        <div
          style={{
            background: "var(--bg-primary)",
            padding: "1rem",
            borderRadius: "12px",
            maxHeight: "220px",
            overflowY: "auto",
            border: "1px solid rgba(90,122,110,0.1)",
          }}
        >
          {ticket.timeline?.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "0.6rem 0",
                borderBottom: "1px solid rgba(0,0,0,0.07)",
              }}
            >
              <strong>{item.action}</strong>
              <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                {new Date(item.at).toLocaleString()}
              </div>
              {item.note && (
                <p style={{ fontSize: "0.9rem", marginTop: "0.2rem" }}>
                  {item.note}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            marginTop: "1.5rem",
            background: "var(--primary-gradient)",
            color: "white",
            padding: "0.7rem 1.3rem",
            borderRadius: "12px",
            width: "100%",
            fontWeight: "600",
            cursor: "pointer",
            border: "none",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

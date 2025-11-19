import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { applicationsAPI } from "../../services/api";

const tabs = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

const badgeClass = (status) => {
  switch (status) {
    case "APPROVED": return "badge success";
    case "REJECTED": return "badge danger";
    case "PENDING": default: return "badge secondary";
  }
};

export default function OwnerApplications() {
  const { user, loading } = useAuth();
  const [active, setActive] = useState("ALL");
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");

  const fetchData = async (status) => {
    setBusy(true);
    setErr("");
    try {
      const res = await applicationsAPI.listForLandlord(status === "ALL" ? undefined : status);
      if (res.success) {
        setItems(res.data || []);
      } else {
        setErr(res.message || "Failed to load applications");
        setItems([]);
      }
    } catch (e) {
      setErr(e?.message || "Failed to load applications");
      setItems([]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchData(active);
    }
  }, [loading, user, active]);

  const counts = useMemo(() => {
    const c = { ALL: items.length, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    items.forEach(a => { if (c[a.status] !== undefined) c[a.status]++; });
    // If active tab is filtered on server, counts will reflect the filtered slice.
    return c;
  }, [items]);

  const handleApprove = async (id) => {
    try {
      const res = await applicationsAPI.approve(id);
      if (!res.success) throw new Error(res.message || "Approve failed");
      // Optimistic update:
      setItems(prev => prev.map(x => x._id === id ? { ...x, status: "APPROVED" } : x));
    } catch (e) {
      alert(e.message || "Approve failed");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await applicationsAPI.reject(id);
      if (!res.success) throw new Error(res.message || "Reject failed");
      setItems(prev => prev.map(x => x._id === id ? { ...x, status: "REJECTED" } : x));
    } catch (e) {
      alert(e.message || "Reject failed");
    }
  };

  if (loading) return <div className="page-wrap"><div className="card">Loading…</div></div>;
  if (!user) return <div className="page-wrap"><div className="card">Please log in.</div></div>;

  return (
    <div className="page-wrap" style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h2 style={{
          fontSize: "2rem",
          fontWeight: 800,
          background: "var(--gradient-hero)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          Applications
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Review tenant applications for your units and manage their status.
        </p>
      </header>

      {/* Tabs */}
      <div className="tabs" style={{ display: "flex", gap: ".5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`tab ${active === t.key ? "active" : ""}`}
            style={{
              padding: ".6rem 1rem",
              borderRadius: "999px",
              border: "1px solid rgba(102,126,234,.25)",
              background: active === t.key ? "var(--primary-gradient)" : "var(--bg-card)",
              color: active === t.key ? "#fff" : "var(--text-primary)",
              boxShadow: "var(--shadow-sm)",
              cursor: "pointer"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Errors */}
      {err && (
        <div style={{
          background: "rgba(239,68,68,.1)",
          border: "1px solid rgba(239,68,68,.3)",
          color: "var(--text-primary)",
          borderRadius: 12, padding: "1rem", marginBottom: "1rem"
        }}>
          ⚠️ {err}
        </div>
      )}

      {/* Table */}
      <div className="card" style={{
        background: "var(--bg-card)",
        border: "1px solid rgba(102,126,234,.12)",
        borderRadius: 16,
        boxShadow: "var(--shadow-lg)",
        overflow: "hidden"
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: "rgba(102,126,234,.06)" }}>
                <Th>Applicant</Th>
                <Th>Unit</Th>
                <Th>Property</Th>
                <Th>Rent</Th>
                <Th>Status</Th>
                <Th>Applied</Th>
                <Th style={{ minWidth: 220 }}>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {busy ? (
                <tr><Td colSpan={7}>Loading…</Td></tr>
              ) : items.length === 0 ? (
                <tr><Td colSpan={7}>No applications found.</Td></tr>
              ) : (
                items.map(a => (
                  <tr key={a._id} style={{ borderTop: "1px solid rgba(102,126,234,.1)" }}>
                    <Td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong>{a.tenantId?.name || "—"}</strong>
                        <span style={{ color: "var(--text-secondary)", fontSize: ".9rem" }}>
                          {a.tenantId?.email || "—"}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <div><strong>#{a.unitId?.unitNumber ?? "—"}</strong></div>
                      <div style={{ color: "var(--text-secondary)", fontSize: ".9rem" }}>
                        {a.unitId?.status || "—"}
                      </div>
                    </Td>
                    <Td>
                      <div><strong>{a.unitId?.propertyId?.name || "—"}</strong></div>
                      <div style={{ color: "var(--text-secondary)", fontSize: ".9rem" }}>
                        {formatAddress(a.unitId?.propertyId?.address)}
                      </div>
                    </Td>
                    <Td>{formatMoney(a.unitId?.rentAmount)}</Td>
                    <Td>
                      <span className={badgeClass(a.status)} style={badgeStyle(a.status)}>
                        {a.status}
                      </span>
                    </Td>
                    <Td>{formatDate(a.createdAt)}</Td>
                    <Td>
                      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                        <button
                          className="btn"
                          disabled={a.status !== "PENDING"}
                          onClick={() => handleApprove(a._id)}
                          style={btnStyle(a.status === "PENDING" ? "success" : "muted")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn"
                          disabled={a.status !== "PENDING"}
                          onClick={() => handleReject(a._id)}
                          style={btnStyle(a.status === "PENDING" ? "danger" : "muted")}
                        >
                          Reject
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Small presentational helpers
const Th = ({ children, style, ...rest }) => (
  <th {...rest} style={{
    textAlign: "left",
    padding: ".9rem 1rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    borderBottom: "1px solid rgba(102,126,234,.12)",
    ...style
  }}>{children}</th>
);

const Td = ({ children, style, ...rest }) => (
  <td {...rest} style={{
    padding: "1rem",
    color: "var(--text-primary)",
    verticalAlign: "top",
    ...style
  }}>{children}</td>
);

const badgeStyle = (status) => ({
  display: "inline-block",
  padding: ".35rem .65rem",
  borderRadius: "999px",
  fontWeight: 700,
  fontSize: ".82rem",
  background:
    status === "APPROVED" ? "rgba(16,185,129,.15)"
    : status === "REJECTED" ? "rgba(239,68,68,.15)"
    : "rgba(107,114,128,.15)",
  border:
    status === "APPROVED" ? "1px solid rgba(16,185,129,.35)"
    : status === "REJECTED" ? "1px solid rgba(239,68,68,.35)"
    : "1px solid rgba(107,114,128,.35)",
  color:
    status === "APPROVED" ? "rgb(16,185,129)"
    : status === "REJECTED" ? "rgb(239,68,68)"
    : "rgb(107,114,128)"
});

const btnStyle = (variant) => {
  const base = {
    padding: ".55rem .9rem",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid transparent",
    boxShadow: "var(--shadow-sm)",
  };
  switch (variant) {
    case "success": return { ...base, background: "rgba(16,185,129,1)", color: "#fff" };
    case "danger": return { ...base, background: "rgba(239,68,68,1)", color: "#fff" };
    default: return { ...base, background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid rgba(102,126,234,.25)", cursor: "not-allowed", opacity: .7 };
  }
};

const formatMoney = (v) => (typeof v === "number" ? `$${v.toFixed(2)}` : "—");
const formatDate = (iso) => iso ? new Date(iso).toLocaleString() : "—";
const formatAddress = (a) => {
  if (!a) return "";
  const parts = [a.line1, a.city, a.state, a.country, a.postalCode].filter(Boolean);
  return parts.join(", ");
};

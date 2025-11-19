import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import { applicationsAPI } from "../../services/api";

const statusColor = {
  APPROVED: "#16a34a",
  REJECTED: "#dc2626",
  PENDING: "#ca8a04",
};

const API_BASE_URL = "http://localhost:9000/api";

export default function MyApplications() {
  const { user, loading: authLoading } = useAuth();
  const [apps, setApps] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    if (!authLoading && user) fetchApplications();
  }, [authLoading, user]);

  const fetchApplications = async () => {
    try {
      setBusy(true);
      setError("");
      const res = await applicationsAPI.listForTenant();
      if (res.success) setApps(res.data || []);
      else setError(res.message || "Failed to load applications.");
    } catch (err) {
      console.error(err);
      setError("Unable to fetch applications. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    return (apps || [])
      .filter((a) =>
        statusFilter === "ALL" ? true : a.status === statusFilter
      )
      .filter((a) => {
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        const property = a?.unitId?.propertyId?.name || "";
        const unit = String(a?.unitId?.unitNumber || "");
        return property.toLowerCase().includes(s) || unit.toLowerCase().includes(s);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [apps, search, statusFilter]);

  const withdrawPending = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return setError("Please login again.");

    if (!window.confirm("Are you sure you want to withdraw this application?"))
      return;

    try {
      setWithdrawingId(id);
      const resp = await fetch(`${API_BASE_URL}/applications/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.message);
      setApps((prev) => prev.filter((x) => x._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to withdraw application.");
    } finally {
      setWithdrawingId(null);
    }
  };

  if (authLoading || busy) {
    return (
      <div className="dashboard-container" style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div
            style={{
              width: 60,
              height: 60,
              margin: "0 auto 1rem",
              border: "4px solid rgba(102,126,234,0.2)",
              borderTop: "4px solid var(--primary-light)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "var(--text-secondary)" }}>Loading your applications…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "center" }}>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              background: "var(--gradient-hero)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}
          >
            My Applications
          </h2>
          <button onClick={fetchApplications} style={btnSecondary}>
            ⟳ Refresh
          </button>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 200px",
            gap: 12,
            marginTop: 16,
          }}
        >
          <input
            placeholder="Search by property or unit…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputBox}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectBox}
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {error && <div style={alertError}>⚠️ {error}</div>}

        {/* Applications */}
        {filtered.length === 0 ? (
          <div style={emptyWrap}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
            <h3 style={{ color: "var(--text-primary)" }}>No applications found</h3>
            <p style={{ color: "var(--text-secondary)" }}>
              Try adjusting filters or apply to a property to see it here.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 20,
              marginTop: 20,
            }}
          >
            {filtered.map((a) => {
              const propertyName = a?.unitId?.propertyId?.name || "—";
              const unitNumber = a?.unitId?.unitNumber ? `#${a.unitId.unitNumber}` : "—";
              const rent = a?.unitId?.rentAmount ? `$${a.unitId.rentAmount}` : "—";
              const created = new Date(a.createdAt).toLocaleDateString();

              return (
                <div key={a._id} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={title}>{propertyName}</div>
                      <div style={subtle}>Unit {unitNumber}</div>
                    </div>
                    <span style={{ ...badge, color: statusColor[a.status] }}>{a.status}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                    <InfoRow label="Rent" value={rent} />
                    <InfoRow label="Applied" value={created} />
                  </div>

                  {a.note && (
                    <div style={{ marginTop: 10, fontSize: 13, color: "var(--text-secondary)" }}>
                      <strong>Note:</strong> {a.note}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                    <button style={btnGhost} onClick={() => setSelected(a)}>
                      Details
                    </button>
                    {a.status === "APPROVED" && (
                      <button
                        style={btnPrimary}
                        onClick={() =>
                          window.open(`${API_BASE_URL}/applications/${a._id}/pdf`, "_blank")
                        }
                      >
                        View Invoice
                      </button>
                    )}
                    {a.status === "PENDING" && (
                      <button
                        style={{
                          ...btnDanger,
                          opacity: withdrawingId === a._id ? 0.7 : 1,
                        }}
                        onClick={() => withdrawPending(a._id)}
                        disabled={withdrawingId === a._id}
                      >
                        {withdrawingId === a._id ? "Withdrawing…" : "Withdraw"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selected && <DetailsModal app={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}

/* ---------- Helper Components ---------- */

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "rgba(102, 126, 234, 0.05)",
        border: "1px solid rgba(102,126,234,0.15)",
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function DetailsModal({ app, onClose }) {
  const propertyName = app?.unitId?.propertyId?.name || "—";
  const address = app?.unitId?.propertyId?.address || "—";
  const unit = app?.unitId?.unitNumber ? `#${app.unitId.unitNumber}` : "—";
  const rent = app?.unitId?.rentAmount ? `$${app.unitId.rentAmount}` : "—";
  const status = app?.status || "—";
  const created = new Date(app.createdAt).toLocaleString();

  return (
    <div style={modalWrap}>
      <div style={modalCard}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3 style={{ color: "var(--text-primary)" }}>Application Details</h3>
          <button style={btnIcon} onClick={onClose}>✕</button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InfoRow label="Property" value={propertyName} />
          <InfoRow label="Unit" value={unit} />
          <InfoRow label="Rent" value={rent} />
          <InfoRow label="Status" value={status} />
          <InfoRow label="Applied" value={created} />
          <InfoRow label="Address" value={address} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button style={btnGhost} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const inputBox = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  outline: "none",
};

const selectBox = { ...inputBox };

const btnPrimary = {
  padding: ".55rem .9rem",
  background: "var(--primary-gradient)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontSize: ".9rem",
  fontWeight: 600,
};

const btnSecondary = {
  ...btnPrimary,
  background: "rgba(102,126,234,0.1)",
  color: "var(--text-primary)",
};

const btnGhost = {
  ...btnSecondary,
  background: "transparent",
  border: "1px solid rgba(0,0,0,0.08)",
};

const btnDanger = {
  ...btnGhost,
  background: "rgba(220,38,38,0.1)",
  color: "#dc2626",
  border: "1px solid rgba(220,38,38,0.25)",
};

const card = {
  background: "var(--bg-card)",
  borderRadius: 16,
  border: "1px solid rgba(102,126,234,0.12)",
  boxShadow: "var(--shadow-md)",
  padding: 16,
};

const title = { fontWeight: 800, color: "var(--text-primary)", fontSize: 18 };
const subtle = { color: "var(--text-secondary)", fontSize: 13 };
const badge = { padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 };
const alertError = {
  marginTop: 16,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(239, 68, 68, 0.3)",
  background: "rgba(239, 68, 68, 0.08)",
  color: "var(--text-primary)",
};
const emptyWrap = {
  marginTop: 28,
  padding: "3rem 1rem",
  background: "var(--bg-card)",
  borderRadius: 16,
  textAlign: "center",
};
const modalWrap = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
  padding: 16,
};
const modalCard = {
  width: "min(720px, 95vw)",
  background: "var(--bg-card)",
  borderRadius: 16,
  padding: 20,
};
const btnIcon = {
  border: "none",
  background: "transparent",
  color: "var(--text-primary)",
  cursor: "pointer",
  fontSize: 18,
};

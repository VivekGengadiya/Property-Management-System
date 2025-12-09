import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { apiCall } from "../../services/api";

const StaffTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const statusFilter = query.get("status");
  const todayFilter = query.get("today");
  const overdueFilter = query.get("overdue");

const loadTickets = async () => {
  try {
    console.log("Fetching staff tickets...");

    const res = await apiCall(`/maintenance/staff/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log("Tickets API Response:", res);

    if (!res.success) {
      throw new Error(res.message || "Failed to load staff tickets");
    }

    let items = res.data || [];

    // Status filter
    if (statusFilter) {
      items = items.filter((t) => t.status === statusFilter);
    }

    // Today's tasks
    if (todayFilter) {
      items = items.filter(
        (t) =>
          new Date(t.createdAt).toDateString() ===
          new Date().toDateString()
      );
    }

    // Overdue tickets (older than 7 days & unresolved)
    if (overdueFilter) {
      items = items.filter((t) => {
        const daysOld =
          (Date.now() - new Date(t.createdAt)) /
          (1000 * 60 * 60 * 24);
        return daysOld > 7 && t.status !== "RESOLVED";
      });
    }

    // Search filter
    if (search.trim() !== "") {
      items = items.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.unitId?.unitNumber?.toString().includes(search)
      );
    }

    setTickets(items);

  } catch (error) {
    console.error("Error loading staff tickets:", error);
  }
};


  useEffect(() => {
    loadTickets();
  }, [search, location.search]);

  return (
    <div>
      <Navbar />

      <div className="premium-container" style={{ padding: "3rem" }}>
        {/* Header */}
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "800",
            marginBottom: "1rem",
            textAlign: "center",
            background: "var(--gradient-hero)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gradientShift 5s ease infinite",
            backgroundSize: "200% 200%",
          }}
        >
          My Tickets
        </h1>

        <p
          style={{
            textAlign: "center",
            fontSize: "1.2rem",
            color: "var(--text-secondary)",
            marginBottom: "2rem",
          }}
        >
          View and update all tickets assigned to you.
        </p>

        {/* Filters Tabs */}
        <div
          style={{
            background: "var(--bg-card)",
            padding: "1rem",
            borderRadius: "20px",
            marginBottom: "2rem",
            border: "1px solid rgba(90, 122, 110, 0.1)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "All", value: "" },
              // { label: "Open", value: "OPEN" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "On Hold", value: "ON_HOLD" },
              { label: "Resolved", value: "RESOLVED" },
              // { label: "Today", value: "today" },
              { label: "Overdue", value: "overdue" },
            ].map((f, i) => {
              const active =
                (statusFilter === f.value && f.value !== "") ||
                (f.value === "" && !statusFilter && !todayFilter && !overdueFilter) ||
                (todayFilter && f.value === "today") ||
                (overdueFilter && f.value === "overdue");

              const query =
                f.value === ""
                  ? ""
                  : f.value === "today"
                  ? "?today=true"
                  : f.value === "overdue"
                  ? "?overdue=true"
                  : `?status=${f.value}`;

              return (
                <button
                  key={i}
                  onClick={() => navigate(`/staff/tickets${query}`)}
                  style={{
                    padding: "0.8rem 1.5rem",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "600",
                    background: active
                      ? "var(--primary-gradient)"
                      : "rgba(90, 122, 110, 0.1)",
                    color: active ? "white" : "var(--text-secondary)",
                    transition: "0.2s",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <input
            type="text"
            placeholder="Search by title or unit number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "0.8rem 1.2rem",
              width: "60%",
              maxWidth: "450px",
              borderRadius: "12px",
              border: "1px solid rgba(90, 122, 110, 0.3)",
              outline: "none",
              boxShadow: "var(--shadow-sm)",
            }}
          />
        </div>

        {/* Ticket Table */}
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: "20px",
            border: "1px solid rgba(90, 122, 110, 0.1)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%" }}>
            <thead>
              <tr style={{ background: "rgba(90, 122, 110, 0.08)" }}>
                {[
                  "Unit",
                  "Title",
                  "Category",
                  "Priority",
                  "Status",
                  "Created At",
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
                    colSpan="7"
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      opacity: 0.6,
                    }}
                  >
                    No tickets found.
                  </td>
                </tr>
              )}

              {tickets.map((t) => (
                <tr key={t._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "1rem" }}>
                    {t.unitId?.unitNumber || "-"}
                  </td>
                  <td style={{ padding: "1rem" }}>{t.title}</td>
                  <td style={{ padding: "1rem" }}>{t.category}</td>
                  <td style={{ padding: "1rem" }}>{t.priority}</td>
                  <td style={{ padding: "1rem" }}>{t.status}</td>
                  <td style={{ padding: "1rem" }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>

                  <td style={{ padding: "1rem" }}>
                    <button
                      onClick={() => navigate(`/staff/ticket/${t._id}`)}
                      style={{
                        padding: "0.4rem 0.7rem",
                        background: "var(--primary)",
                        color: "white",
                        borderRadius: "8px",
                        marginRight: "0.5rem",
                      }}
                    >
                      View
                    </button>

                   <button
  onClick={() => navigate(`/staff/ticket/${t._id}?update=true`)}
  disabled={t.status === "RESOLVED"}
  style={{
    padding: "0.4rem 0.7rem",
    background: t.status === "RESOLVED" ? "#999" : "seagreen",
    color: "white",
    borderRadius: "8px",
    cursor: t.status === "RESOLVED" ? "not-allowed" : "pointer",
    opacity: t.status === "RESOLVED" ? 0.6 : 1,
  }}
>
  Update
</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <style>{`
          @keyframes gradientShift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
        `}</style>
      </div>

      <Footer />
    </div>
  );
};

export default StaffTickets;

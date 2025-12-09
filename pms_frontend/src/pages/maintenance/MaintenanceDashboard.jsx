import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { useNavigate } from "react-router-dom";

import { apiCall } from "../../services/api";

const MaintenanceDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate(); 

 const loadStats = async () => {
  try {

    const res = await apiCall(`/maintenance/dashboard/staff`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.success) {
      throw new Error(res.message || "Failed to load dashboard stats");
    }

    setStats(res.data?.stats || {});
    setRecent(res.data?.recentActivities || []);

  } catch (e) {
    console.error("Error loading staff dashboard", e);
  }
};

  useEffect(() => {
    loadStats();
  }, []);

  if (!stats)
    return (
      <p style={{ padding: "2rem", textAlign: "center", opacity: 0.7 }}>
        Loading dashboard...
      </p>
    );

  // Click handlers for cards
  const goTo = (query = "") => {
    navigate(`/staff/tickets${query}`);
  };

  const cards = [
    { label: "Total Assigned", value: stats.totalAssigned, icon: "🧰", query: "" },
    // { label: "Open", value: stats.open, icon: "📌", query: "?status=OPEN" },
    { label: "In Progress", value: stats.inProgress, icon: "🔧", query: "?status=IN_PROGRESS" },
    { label: "On Hold", value: stats.onHold, icon: "⏸️", query: "?status=ON_HOLD" },
    { label: "Resolved", value: stats.resolved, icon: "✅", query: "?status=RESOLVED" },
    // { label: "Today’s Tasks", value: stats.todayTasks, icon: "📅", query: "?today=true" },
    { label: "Overdue", value: stats.overdue, icon: "⏰", query: "?overdue=true" }
  ];

  return (
    <div>
      <Navbar />

      <div style={{ padding: "3rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "800",
            marginBottom: "1rem",
            textAlign: "center",
            background: "var(--gradient-hero)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "gradientShift 5s ease infinite",
            backgroundSize: "200% 200%",
          }}
        >
          Maintenance Staff Dashboard
        </h1>

        <p
          style={{
            textAlign: "center",
            fontSize: "1.2rem",
            color: "var(--text-secondary)",
            marginBottom: "3rem",
          }}
        >
          Track your assigned work, progress, and recent updates.
        </p>

        {/* Stats Cards - Premium Style */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          {cards.map((stat, index) => (
            <div
              key={index}
              onClick={() => goTo(stat.query)} 
              style={{
                background: "var(--bg-card)",
                padding: "2rem 1.5rem",
                borderRadius: "20px",
                border: "1px solid rgba(90, 122, 110, 0.1)",
                boxShadow: "var(--shadow-md)",
                textAlign: "center",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
            >
              <div
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "1rem",
                  filter: "drop-shadow(0 3px 10px rgba(90, 122, 110, 0.3))",
                }}
              >
                {stat.icon}
              </div>

              <h3
                style={{
                  fontSize: "2rem",
                  background: "var(--gradient-hero)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "0.5rem",
                }}
              >
                {stat.value}
              </h3>

              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: "600",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <style >{`
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

export default MaintenanceDashboard;

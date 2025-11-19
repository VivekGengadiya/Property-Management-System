import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

export default function TicketCard({ t, onQuick }) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontWeight: 600 }}>{t.title}</div>
            <StatusBadge status={t.status} />
            <PriorityBadge priority={t.priority} />
          </div>

          <div style={{ color: "#4b5563", fontSize: 14, marginTop: 4 }}>
            {t.description}
          </div>

          <div style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>
            {t.propertyName} · Unit {t.unitNumber} · {new Date(t.updatedAt).toLocaleString()}
          </div>

          <Link
            to={`/staff/assigned/${t.id}`}
            style={{ fontSize: 14, textDecoration: "underline", marginTop: 6, display: "inline-block" }}
          >
            Open details
          </Link>
        </div>

        {onQuick && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {t.status !== "OPEN" && (
              <button onClick={() => onQuick("OPEN")} className="btn-outline">Set OPEN</button>
            )}
            {t.status !== "IN_PROGRESS" && (
              <button onClick={() => onQuick("IN_PROGRESS")} className="btn-outline">In Progress</button>
            )}
            {t.status !== "RESOLVED" && (
              <button onClick={() => onQuick("RESOLVED")} className="btn-outline">Resolve</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";

export default function StatusBadge({ status }) {
  const map = {
    OPEN: { bg: "#ffe8e8", fg: "#a30000" },
    IN_PROGRESS: { bg: "#fff7e0", fg: "#8a5a00" },
    RESOLVED: { bg: "#e8ffe8", fg: "#0a7a0a" },
  };
  const { bg, fg } = map[status] || { bg: "#eee", fg: "#333" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        background: bg,
        color: fg,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {status.replace("_", " ")}
    </span>
  );
}

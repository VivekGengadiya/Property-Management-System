import React from "react";

export default function PriorityBadge({ priority }) {
  const map = {
    LOW: { bg: "#edf2f7", fg: "#2d3748" },
    MEDIUM: { bg: "#ebf8ff", fg: "#2b6cb0" },
    HIGH: { bg: "#fffaf0", fg: "#975a16" },
    URGENT: { bg: "#ffe8e8", fg: "#a30000" },
  };
  const { bg, fg } = map[priority] || { bg: "#eee", fg: "#333" };
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
      {priority}
    </span>
  );
}

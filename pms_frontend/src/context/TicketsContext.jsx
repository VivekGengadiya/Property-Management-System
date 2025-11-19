import React, { createContext, useContext, useMemo, useReducer } from "react";

/** ---- Mock tickets (replace with API later) ---- */
const initialTickets = 
[
  {
    id: "T-1001",
    title: "Leaking kitchen sink",
    description:
      "Water dripping under the sink cabinet. Suspected worn-out P-trap.",
    category: "PLUMBING",
    priority: "HIGH",
    status: "OPEN",
    propertyName: "Maple Residences",
    unitNumber: "12B",
    tenant: { name: "Aisha Khan", phone: "555-321-9000" },
    attachments: [
      {
        url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop",
        name: "leak-photo.jpg",
      },
    ],
    activity: [
      { at: Date.now() - 1000 * 60 * 60 * 12, by: "System", action: "Created" },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    updatedAt: Date.now() - 1000 * 60 * 10,
    assignedToMe: true,
  },
  {
    id: "T-1002",
    title: "Air conditioner not cooling",
    description:
      "AC runs but does not cool effectively. Possible low refrigerant or dirty filter.",
    category: "HVAC",
    priority: "URGENT",
    status: "IN_PROGRESS",
    propertyName: "Cedar Park",
    unitNumber: "3A",
    tenant: { name: "Luis Romero", phone: "555-777-4444" },
    attachments: [],
    activity: [
      { at: Date.now() - 1000 * 60 * 60 * 36, by: "System", action: "Created" },
      { at: Date.now() - 1000 * 60 * 60 * 4, by: "You", action: "Marked IN_PROGRESS" },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
    assignedToMe: true,
  },
  {
    id: "T-1003",
    title: "Hallway light flickering",
    description: "Common area light intermittently flickers.",
    category: "ELECTRICAL",
    priority: "MEDIUM",
    status: "RESOLVED",
    propertyName: "Pine View",
    unitNumber: "Common Area",
    tenant: { name: "—", phone: "—" },
    attachments: [],
    activity: [
      { at: Date.now() - 1000 * 60 * 60 * 72, by: "System", action: "Created" },
      { at: Date.now() - 1000 * 60 * 60 * 24, by: "You", action: "Marked RESOLVED" },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    assignedToMe: true,
  },

  {
    id: "T-1004",
    title: "Hallway light flickering",
    description: "Common area light intermittently flickers.",
    category: "ELECTRICAL",
    priority: "MEDIUM",
    status: "RESOLVED",
    propertyName: "Pine View",
    unitNumber: "Common Area",
    tenant: { name: "Utkarsh Solanki", phone: "—" },
    attachments: [],
    activity: [
      { at: Date.now() - 1000 * 60 * 60 * 72, by: "System", action: "Created" },
      { at: Date.now() - 1000 * 60 * 60 * 24, by: "You", action: "Marked RESOLVED" },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    assignedToMe: true,
  },
];

const TicketsCtx = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_STATUS": {
      const { id, status } = action;
      return state.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              updatedAt: Date.now(),
              activity: [
                ...t.activity,
                { at: Date.now(), by: "You", action: `Marked ${status}` },
              ],
            }
          : t
      );
    }
    case "ADD_NOTE": {
      const { id, note } = action;
      return state.map((t) =>
        t.id === id
          ? {
              ...t,
              updatedAt: Date.now(),
              activity: [...t.activity, { at: Date.now(), by: "You", action: "Note", note }],
            }
          : t
      );
    }
    default:
      return state;
  }
}

export function TicketsProvider({ children }) {
  const [tickets, dispatch] = useReducer(reducer, initialTickets);

  const api = useMemo(
    () => ({
      listAssigned: ({ status, priority, search } = {}) => {
        let rows = tickets.filter((t) => t.assignedToMe);
        if (status) rows = rows.filter((t) => t.status === status);
        if (priority) rows = rows.filter((t) => t.priority === priority);
        if (search) {
          const q = search.toLowerCase();
          rows = rows.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.description.toLowerCase().includes(q) ||
              `${t.propertyName} ${t.unitNumber}`.toLowerCase().includes(q)
          );
        }
        return rows.sort((a, b) => b.updatedAt - a.updatedAt);
      },
      get: (id) => tickets.find((t) => t.id === id) || null,
      summary: () => ({
        open: tickets.filter((t) => t.assignedToMe && t.status === "OPEN").length,
        inProgress: tickets.filter((t) => t.assignedToMe && t.status === "IN_PROGRESS").length,
        resolved: tickets.filter((t) => t.assignedToMe && t.status === "RESOLVED").length,
        recent: [...tickets]
          .filter((t) => t.assignedToMe)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 5),
      }),
      updateStatus: (id, status) => dispatch({ type: "UPDATE_STATUS", id, status }),
      addNote: (id, note) => dispatch({ type: "ADD_NOTE", id, note }),
    }),
    [tickets]
  );

  return <TicketsCtx.Provider value={api}>{children}</TicketsCtx.Provider>;
}

export function useTickets() {
  const ctx = useContext(TicketsCtx);
  if (!ctx) throw new Error("useTickets must be used within <TicketsProvider>");
  return ctx;
}

/** Optional minimal styles for buttons/inputs (remove if using Tailwind/your own styles) */
if (typeof document !== "undefined" && !document.getElementById("maint-styles")) {
  const style = document.createElement("style");
  style.id = "maint-styles";
  style.innerHTML = `
    .btn-outline { border: 1px solid #d1d5db; padding: 6px 10px; border-radius: 8px; background: #fff; cursor: pointer; }
    .btn-outline:hover { background: #f9fafb; }
    .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; background: #fff; }
    .kpi .label { color: #6b7280; font-size: 12px; }
    .kpi .value { font-size: 28px; font-weight: 700; }
    select, input { border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 10px; }
  `;
  document.head.appendChild(style);
}

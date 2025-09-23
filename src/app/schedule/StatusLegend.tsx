"use client";

const STATUS = [
  { key: "Available", color: "#e5e7eb" },
  { key: "Off/Lunch", color: "#9ca3af" },
  { key: "Signed-In", color: "#2563eb" },
  { key: "Signed-Out", color: "#4b5563" },
  { key: "Confirmed", color: "#059669" },
  { key: "Unconfirmed", color: "#f59e0b" },
  { key: "Left Message", color: "#a855f7" },
  { key: "Missed", color: "#ef4444" },
  { key: "Cancelled", color: "#6b7280" },
  { key: "Year-Out", color: "#f97316" },
];

export default function StatusLegend() {
  return (
    <div className="w-56 shrink-0 rounded border p-3">
      <div className="mb-2 text-sm font-medium">Status</div>
      <ul className="space-y-1 text-sm">
        {STATUS.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
            {s.key}
          </li>
        ))}
      </ul>
    </div>
  );
}

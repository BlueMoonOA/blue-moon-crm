// src/lib/schedule-colors.ts
// Map your AppointmentStatus enum values to Tailwind classes.
// Tweak to your liking.
export const statusColor: Record<string, string> = {
  AVAILABLE: "bg-gray-50 border-gray-200 text-gray-700",
  OFF_LUNCH: "bg-gray-200 text-gray-700",
  SIGNED_IN: "bg-amber-100 border-amber-300 text-amber-900",
  SIGNED_OUT: "bg-sky-100 border-sky-300 text-sky-900",
  CONFIRMED: "bg-green-100 border-green-300 text-green-900",
  UNCONFIRMED: "bg-yellow-100 border-yellow-300 text-yellow-900",
  LEFT_MESSAGE: "bg-purple-100 border-purple-300 text-purple-900",
  MISSED: "bg-rose-100 border-rose-300 text-rose-900",
  CANCELLED: "bg-neutral-200 text-neutral-700",
  YEAR_OUT: "bg-neutral-100 text-neutral-600",
};

export function colorForStatus(status?: string | null) {
  if (!status) return "bg-gray-100 text-gray-700";
  return statusColor[status] ?? "bg-gray-100 text-gray-700";
}

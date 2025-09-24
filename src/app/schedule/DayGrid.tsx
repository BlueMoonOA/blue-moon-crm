"use client";
import type { Consultant, Appt, DayPayload } from "./types";

function makeSlots(startHour = 6, endHour = 19, stepMin = 15) {
  const out: { hh: number; mm: number; label24: string; label12: string }[] = [];
  for (let m = startHour * 60; m <= endHour * 60; m += stepMin) {
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    const label24 = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    const label12 = new Date(`1970-01-01T${label24}:00Z`).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    out.push({ hh, mm, label24, label12 });
  }
  return out;
}

function minutesSinceMidnight(iso: string) {
  const d = new Date(iso);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

export default function DayGrid({
  payload,
  onCreate,
}: {
  payload: DayPayload | null;
  onCreate?: (draft: { consultantId: string; startISO: string; durationMin: number }) => void;
}) {
  if (!payload) return <div className="p-4 text-sm text-gray-500">Loading…</div>;
  const { consultants, appointments: appts, dateISO } = payload;

  const slots = makeSlots(6, 19, 15); // 06:00 → 19:00, 15-min steps

  return (
    <div className="min-w-[900px]">
      {/* header */}
      <div
        className="sticky top-0 z-10 grid grid-cols-[120px_repeat(var(--cols),1fr)] border-b bg-gray-50 text-sm"
        style={{ ["--cols" as any]: consultants.length }}
      >
        <div className="px-2 py-2 font-medium">Time</div>
        {consultants.map((c) => (
          <div key={c.id} className="px-2 py-2 font-medium border-l">
            {c.name}
          </div>
        ))}
      </div>

      {/* grid */}
      <div
        className="grid grid-cols-[120px_repeat(var(--cols),1fr)] relative"
        style={{ ["--cols" as any]: consultants.length }}
      >
        {/* left gutter */}
        <div className="border-r">
          {slots.map((s, i) => (
            <div
              key={i}
              className="h-6 border-b text-[11px] px-2 leading-6 text-gray-500 select-none"
            >
              {s.label12}
            </div>
          ))}
        </div>

        {/* columns */}
        {consultants.map((c) => {
          const columnAppts = appts.filter((a) => a.consultantId === c.id);
          return (
            <div key={c.id} className="relative border-l">
              {/* 15-min rows (click target) */}
              {slots.map((s, i) => {
                const iso = `${dateISO}T${s.label24}:00.000Z`;
                return (
                  <div
                    key={i}
                    className="h-6 border-b"
                    onDoubleClick={() =>
                      onCreate?.({
                        consultantId: c.id,
                        startISO: iso,
                        durationMin: 30, // default new appt length
                      })
                    }
                    title="Double-click to create"
                  />
                );
              })}

              {/* existing appt blocks */}
              {columnAppts.map((a) => {
                const startMin = minutesSinceMidnight(a.startISO);
                const height = Math.max(1, Math.round(a.durationMin / 15)) * 24; // 24px per 15min
                const top = Math.round(startMin / 15) * 24;
                return (
                  <div
                    key={a.id}
                    className="absolute left-1 right-1 rounded bg-teal-600 text-white text-xs p-1 shadow"
                    style={{ top, height }}
                    title={`${new Date(a.startISO).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })} • ${a.durationMin}m`}
                  >
                    <div className="truncate">{a.clientName || "(no client)"}</div>
                    <div className="opacity-80">{a.status || ""}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}



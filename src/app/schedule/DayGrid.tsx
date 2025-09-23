"use client";
import type { DayPayload } from "./_types";

function minutesSinceMidnight(iso: string) {
  const d = new Date(iso);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

export default function DayGrid({ payload }: { payload: DayPayload | null }) {
  if (!payload) return <div className="p-4 text-sm text-gray-500">Loading</div>;
  const { consultants, appts } = payload;

  return (
    <div className="overflow-auto">
      <div className="min-w-[900px]">
        <div className="sticky top-0 z-10 grid grid-cols-[120px_repeat(var(--cols),1fr)] border-b bg-gray-50 text-sm"
             style={{ ["--cols" as any]: consultants.length }}>
          <div className="px-2 py-2 font-medium">Time</div>
          {consultants.map(c => (
            <div key={c.id} className="px-2 py-2 font-medium border-l">{c.name}</div>
          ))}
        </div>

        <div className="grid grid-cols-[120px_repeat(var(--cols),1fr)]"
             style={{ ["--cols" as any]: consultants.length }}>
          {/* Left time gutter */}
          <div className="border-r">
            {Array.from({ length: 24 * 4 }).map((_, i) => {
              const hh = Math.floor(i / 4).toString().padStart(2, "0");
              const mm = (i % 4) * 15;
              const label = `${hh}:${mm.toString().padStart(2,"0")}`;
              return <div key={i} className="h-6 border-b text-[11px] px-2 leading-6 text-gray-500">{label}</div>;
            })}
          </div>

          {/* Columns */}
          {consultants.map(c => {
            const columnAppts = appts.filter(a => a.consultantId === c.id);
            return (
              <div key={c.id} className="relative border-l">
                {/* 15-min rows */}
                {Array.from({ length: 24 * 4 }).map((_, i) => (
                  <div key={i} className="h-6 border-b" />
                ))}
                {/* appt blocks */}
                {columnAppts.map(a => {
                  const startMin = minutesSinceMidnight(a.startAt);
                  const height = Math.max(1, Math.round((a.durationMin / 15))) * 24; // 24px per 15 min (h-6)
                  const top = Math.round((startMin / 15)) * 24;
                  return (
                    <div key={a.id}
                         className="absolute left-1 right-1 rounded bg-teal-600 text-white text-xs p-1 shadow"
                         style={{ top, height }}>
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
    </div>
  );
}

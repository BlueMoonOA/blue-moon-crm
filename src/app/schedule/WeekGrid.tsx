"use client";
import type { WeekPayload } from "./_types";

export default function WeekGrid({ payload }: { payload: WeekPayload | null }) {
  if (!payload) return <div className="p-4 text-sm text-gray-500">Loading…</div>;
  const days: string[] = [];
  const start = new Date(payload.start + "T00:00:00.000Z");
  for (let i = 0; i < 7; i++) {
    const d = new Date(start); d.setUTCDate(start.getUTCDate() + i);
    days.push(d.toISOString().slice(0,10));
  }

  // Group by day
  const byDay = new Map<string, WeekPayload["appts"]>();
  days.forEach(d => byDay.set(d, []));
  payload.appts.forEach(a => {
    const key = a.startAt.slice(0,10);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(a);
  });

  return (
    <div className="overflow-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-7 sticky top-0 z-10 border-b bg-gray-50">
          {days.map(d => (
            <div key={d} className="px-3 py-2 font-medium text-sm border-l">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map(d => (
            <div key={d} className="border-l min-h-[600px] p-2">
              {(byDay.get(d) || []).map(a => (
                <div key={a.id} className="mb-2 rounded bg-teal-600 text-white text-xs p-2">
                  <div className="font-medium truncate">{a.clientName || "(no client)"}</div>
                  <div className="opacity-80">
                    {new Date(a.startAt).toISOString().slice(11,16)}  {a.durationMin}m  {a.status || ""}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

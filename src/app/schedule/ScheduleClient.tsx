"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { DayPayload, WeekPayload } from "./types";
import DayGrid from "./DayGrid";
import WeekGrid from "./WeekGrid";

/* ---------- date helpers ---------- */
function toISODate(d: Date) {
  const z = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return z.toISOString().slice(0, 10);
}
function fromISODate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}
function startOfMonthUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}
function endOfMonthUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
}

/* ---------- inline mini calendar (self-contained) ---------- */
function MiniCalendarInline({
  value,
  onChange,
}: {
  value: string; // yyyy-mm-dd
  onChange: (iso: string) => void;
}) {
  const selected = fromISODate(value);
  const today = new Date();

  const first = startOfMonthUTC(selected);
  const last = endOfMonthUTC(selected);

  const pad = first.getUTCDay();
  const cells: (Date | null)[] = Array.from({ length: pad }).map(() => null);
  for (let day = 1; day <= last.getUTCDate(); day++) {
    cells.push(
      new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth(), day))
    );
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const moveMonth = (delta: number) => {
    const d = new Date(selected);
    d.setUTCMonth(d.getUTCMonth() + delta);
    onChange(toISODate(d));
  };

  return (
    <aside
      className="rounded-lg border bg-white p-4 md:sticky md:top-20"
      style={{ minWidth: 260 }}
    >
      {/* month header */}
      <div className="mb-2 flex items-center justify-between">
        <button
          className="inline-flex items-center rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
          onClick={() => moveMonth(-1)}
          aria-label="Previous month"
        >
          ◀
        </button>
        <div className="font-semibold">
          {selected.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>
        <button
          className="inline-flex items-center rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
          onClick={() => moveMonth(1)}
          aria-label="Next month"
        >
          ▶
        </button>
      </div>

      {/* calendar grid */}
      <table className="w-full text-center">
        <thead>
          <tr className="text-xs text-gray-500">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <th key={d} className="py-1">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(cells.length / 7) }).map((_, r) => (
            <tr key={r}>
              {cells.slice(r * 7, r * 7 + 7).map((d, i) => {
                if (!d) return <td key={i} className="py-1" />;
                const sel = isSameDay(d, selected);
                const todayHit = isSameDay(d, today);
                return (
                  <td key={i} className="py-1">
                    <button
                      onClick={() => onChange(toISODate(d))}
                      className={[
                        "h-8 w-8 rounded-full text-sm",
                        sel
                          ? "bg-black text-white"
                          : todayHit
                          ? "ring-1 ring-black/40"
                          : "hover:bg-gray-100",
                      ].join(" ")}
                    >
                      {d.getUTCDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* legend */}
      <div className="mt-4">
        <div className="mb-1 text-sm font-medium">Status</div>
        <ul className="space-y-1 text-sm">
          {[
            ["Available", "#94a3b8"],
            ["Off", "#0ea5e9"],
            ["Signed In", "#1d4ed8"],
            ["Signed Out", "#6b7280"],
            ["Confirmed", "#22c55e"],
            ["Unconfirmed", "#f59e0b"],
            ["Left Message", "#f472b6"],
            ["Missed", "#ef4444"],
            ["Cancelled", "#475569"],
            ["Year-Out", "#f97316"],
          ].map(([label, color]) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: String(color) }}
              />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/* ---------- main container ---------- */
type View = "day" | "week";

export default function ScheduleClient() {
  const [view, setView] = useState<View>("day");
  const [dateISO, setDateISO] = useState<string>(() => toISODate(new Date()));
  const [dayPayload, setDayPayload] = useState<DayPayload | null>(null);
  const [weekPayload, setWeekPayload] = useState<WeekPayload | null>(null);
  const [loading, setLoading] = useState(false);

  // API calls (adjust endpoints if yours are different)
  async function loadDay() {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedule/day?date=${encodeURIComponent(dateISO)}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as DayPayload;
      setDayPayload(data);
    } catch (e) {
      console.error("loadDay failed", e);
      setDayPayload(null);
    } finally {
      setLoading(false);
    }
  }
  async function loadWeek() {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedule/week?start=${encodeURIComponent(dateISO)}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as WeekPayload;
      setWeekPayload(data);
    } catch (e) {
      console.error("loadWeek failed", e);
      setWeekPayload(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (view === "day") loadDay();
    else loadWeek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, dateISO]);

  const headerDate = useMemo(
    () => fromISODate(dateISO).toLocaleDateString(undefined, { dateStyle: "medium" }),
    [dateISO]
  );

  return (
    <div className="mx-auto grid max-w-screen-2xl grid-cols-12 gap-6 p-4">
      {/* LEFT column */}
      <div className="col-span-12 md:col-span-3">
        <MiniCalendarInline value={dateISO} onChange={setDateISO} />
      </div>

      {/* RIGHT column */}
      <section className="col-span-12 md:col-span-9 rounded-lg border bg-white">
        {/* header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              className={`inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 ${
                view === "day" ? "bg-black text-white hover:bg-black" : "bg-white"
              }`}
              onClick={() => setView("day")}
            >
              Daily
            </button>
            <button
              className={`inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 ${
                view === "week" ? "bg-black text-white hover:bg-black" : "bg-white"
              }`}
              onClick={() => setView("week")}
            >
              Weekly
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-sm text-gray-600 md:block">{headerDate}</div>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            />
          </div>
        </div>

        {/* body */}
        <div className="max-h-[calc(100vh-180px)] overflow-auto p-3">
          {loading && !dayPayload && !weekPayload ? (
            <div className="p-4 text-sm text-gray-500">Loading…</div>
          ) : view === "day" ? (
            <DayGrid payload={dayPayload} />
          ) : (
            <WeekGrid payload={weekPayload} />
          )}
        </div>
      </section>
    </div>
  );
}








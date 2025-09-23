// src/app/schedule/ScheduleClient.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { DayPayload, WeekPayload } from "./_types";
import DayGrid from "./DayGrid";
import WeekGrid from "./WeekGrid";
import ScheduleHeader from "./ScheduleHeader";
import MiniCalendar from "./MiniCalendar";
import StatusLegend from "./StatusLegend";

type ViewMode = "day" | "week";

function isoDate(d: Date): string {
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return utc.toISOString().slice(0, 10);
}
function toWeekISO(dateISO: string) {
  return dateISO;
}

export default function ScheduleClient() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams()!;

  const initialView = (search.get("view") as ViewMode) || "day";
  const initialDate = search.get("date") || isoDate(new Date());
  const initialWeek = search.get("week") || toWeekISO(initialDate);
  const initialConsultant = search.get("consultantId") || "";

  const [view, setView] = useState<ViewMode>(initialView);
  const [dateISO, setDateISO] = useState<string>(initialDate);
  const [weekISO, setWeekISO] = useState<string>(initialWeek);
  const [consultantId, setConsultantId] = useState<string>(initialConsultant);

  const [dayPayload, setDayPayload] = useState<DayPayload | null>(null);
  const [weekPayload, setWeekPayload] = useState<WeekPayload | null>(null);

  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", view);
    url.searchParams.set("date", dateISO);
    url.searchParams.set("week", weekISO);
    if (consultantId) url.searchParams.set("consultantId", consultantId);
    else url.searchParams.delete("consultantId");
    router.replace(`${pathname}?${url.searchParams.toString()}`);
  }, [view, dateISO, weekISO, consultantId, pathname, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/schedule/day?date=${encodeURIComponent(dateISO)}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        const payload: DayPayload = await res.json();
        if (!cancelled) setDayPayload(payload);
      } catch {
        if (!cancelled) setDayPayload(null);
      }
    })();
    return () => { cancelled = true; };
  }, [dateISO, tick]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const qs = new URLSearchParams({ start: weekISO });
        if (consultantId) qs.set("consultantId", consultantId);
        const res = await fetch(`/api/schedule/week?${qs.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        const payload: WeekPayload = await res.json();
        if (!cancelled) setWeekPayload(payload);
      } catch {
        if (!cancelled) setWeekPayload(null);
      }
    })();
    return () => { cancelled = true; };
  }, [weekISO, consultantId, tick]);

  const onViewChange = (next: ViewMode) => setView(next);
  const onDateChange = (iso: string) => {
    setDateISO(iso);
    setWeekISO(toWeekISO(iso));
  };
  const onChangeWeek = (nextStartISO: string) => setWeekISO(nextStartISO);
  const onJumpMonths = (months: number) => {
    const d = new Date(dateISO);
    d.setUTCMonth(d.getUTCMonth() + months);
    onDateChange(isoDate(d));
  };
  const onPickConsultant = (id: string) => setConsultantId(id);

  return (
    <div className="schedule-shell">
      {/* LEFT SIDEBAR */}
      <aside className="schedule-sidebar">
        <MiniCalendar valueISO={dateISO} onChange={onDateChange} />
        <div className="legend-panel">
          <StatusLegend />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div>
        <ScheduleHeader
          view={view}
          dateISO={dateISO}
          onViewChange={onViewChange}
          onDateChange={onDateChange}
          onChangeWeek={onChangeWeek}
          onJumpMonths={onJumpMonths}
          onConsultantChange={onPickConsultant}
          onRefresh={refresh}
        />

        <div className="mt-3">
          {view === "day" ? (
            <DayGrid payload={dayPayload} />
          ) : (
            <WeekGrid payload={weekPayload} />
          )}
        </div>
      </div>
    </div>
  );
}



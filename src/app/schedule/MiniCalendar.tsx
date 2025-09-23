// src/app/schedule/MiniCalendar.tsx
"use client";

import { useMemo } from "react";

type Props = {
  valueISO: string;             // currently selected yyyy-mm-dd
  onChange: (iso: string) => void;
};

function isoDate(d: Date) {
  const u = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return u.toISOString().slice(0, 10);
}

export default function MiniCalendar({ valueISO, onChange }: Props) {
  const value = new Date(valueISO);
  const year = value.getUTCFullYear();
  const month = value.getUTCMonth();

  const first = new Date(Date.UTC(year, month, 1));
  const last = new Date(Date.UTC(year, month + 1, 0));
  const daysInMonth = last.getUTCDate();

  // start on Sunday: 0..6
  const leading = first.getUTCDay();

  const cells = useMemo(() => {
    const arr: { date: Date; inMonth: boolean }[] = [];

    // prev-month spill
    for (let i = leading - 1; i >= 0; i--) {
      arr.push({
        date: new Date(Date.UTC(year, month, -i)),
        inMonth: false,
      });
    }
    // this month
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push({
        date: new Date(Date.UTC(year, month, d)),
        inMonth: true,
      });
    }
    // pad to full 6 weeks if needed
    while (arr.length % 7 !== 0) {
      const lastDate = arr[arr.length - 1].date;
      const next = new Date(lastDate);
      next.setUTCDate(next.getUTCDate() + 1);
      arr.push({ date: next, inMonth: false });
    }
    return arr;
  }, [year, month, daysInMonth, leading]);

  const todayISO = isoDate(new Date());

  const prevMonth = () => {
    const d = new Date(Date.UTC(year, month - 1, 1));
    onChange(isoDate(d));
  };
  const nextMonth = () => {
    const d = new Date(Date.UTC(year, month + 1, 1));
    onChange(isoDate(d));
  };

  const monthName = value.toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });

  const dows = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="mini-cal">
      <div className="mini-cal__hdr">
        <button className="nav-btn" onClick={prevMonth}>&lt;</button>
        <div>{monthName} {year}</div>
        <button className="nav-btn" onClick={nextMonth}>&gt;</button>
      </div>

      <div className="mini-cal__grid">
        {dows.map((d) => (
          <div key={d} className="mini-cal__dow">{d}</div>
        ))}
        {cells.map((c, i) => {
          const iso = isoDate(c.date);
          const sel = iso === valueISO;
          const isToday = iso === todayISO;
          return (
            <button
              key={i}
              className={`mini-cal__cell ${sel ? "is-selected" : ""} ${isToday ? "is-today" : ""}`}
              onClick={() => onChange(iso)}
              title={iso}
              style={{ opacity: c.inMonth ? 1 : .45 }}
            >
              {c.date.getUTCDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import type { WeekPayload, Appt } from "./types";

type Props = {
  payload: WeekPayload | null;
  /** called on 15-min slot double-click – iso is the start time */
  onCreate?: (iso: string) => void;
};

/** helper: get a display HH:MM a/p for an ISO UTC */
const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function WeekGrid({ payload, onCreate }: Props) {
  if (!payload) {
    return <div className="p-4 text-sm text-gray-500">Loading…</div>;
  }

  // render a simple “cards in columns” week:
  return (
    <div className="overflow-auto">
      <div className="min-w-[900px]">
        {/* Header */}
        <div className="grid grid-cols-7 sticky top-0 z-10 border-b bg-gray-50">
          {payload.days.map((d) => (
            <div key={d.dateISO} className="px-3 py-2 font-medium text-sm border-l">
              {d.dateISO}
            </div>
          ))}
        </div>

        {/* Columns */}
        <div className="grid grid-cols-7">
          {payload.days.map((d) => (
            <div
              key={d.dateISO}
              className="border-l min-h-[600px] p-2"
              onDoubleClick={(e) => {
                // double-click empty area -> default to 09:00 for now
                const iso = d.dateISO + "T09:00:00.000Z";
                onCreate?.(iso);
              }}
            >
              {(d.appointments || []).map((a: Appt) => (
                <div
                  key={a.id}
                  className="mb-2 rounded bg-teal-600 text-white text-xs p-2 shadow"
                  onDoubleClick={(ev) => {
                    ev.stopPropagation(); // don’t bubble to column
                    onCreate?.(a.startISO);
                  }}
                >
                  <div className="font-medium truncate">
                    {a.clientName || "(no client)"}
                  </div>
                  <div className="opacity-80">
                    {timeLabel(a.startISO)} · {a.durationMin}m · {a.status || ""}
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




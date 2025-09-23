"use client";

type ViewMode = "day" | "week";

export default function ScheduleHeader({
  view,
  dateISO,
  onViewChange,
  onDateChange,
  onChangeWeek,
  onJumpMonths,
  onConsultantChange,
  onRefresh, // optional
}: {
  view: ViewMode;
  dateISO: string;
  onViewChange: (v: ViewMode) => void;
  onDateChange: (iso: string) => void;
  onChangeWeek?: (startISO: string) => void;
  onJumpMonths: (months: number) => void;
  onConsultantChange?: (id: string) => void;
  onRefresh?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded border overflow-hidden">
        <button
          className={`px-3 py-1.5 text-sm ${view === "day" ? "bg-gray-100" : ""}`}
          onClick={() => onViewChange("day")}
          aria-pressed={view === "day"}
        >
          Daily
        </button>
        <button
          className={`px-3 py-1.5 text-sm ${view === "week" ? "bg-gray-100" : ""}`}
          onClick={() => onViewChange("week")}
          aria-pressed={view === "week"}
        >
          Weekly
        </button>
      </div>

      <div className="inline-flex items-center gap-1">
        <button className="rounded border px-2 py-1 text-sm" title="Prev month" onClick={() => onJumpMonths(-1)}></button>
        <input
          type="date"
          className="rounded border px-2 py-1 text-sm"
          value={dateISO}
          onChange={(e) => onDateChange(e.target.value)}
        />
        <button className="rounded border px-2 py-1 text-sm" title="Next month" onClick={() => onJumpMonths(1)}></button>
      </div>

      <div className="ml-auto inline-flex gap-2">
        {onRefresh && (
          <button className="rounded border px-3 py-1.5 text-sm" onClick={onRefresh} title="Refresh (manual)">
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}

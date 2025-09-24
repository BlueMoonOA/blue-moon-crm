/* src/app/schedule/types.ts */

export type Consultant = {
  id: string;
  name: string;
};

export type Appt = {
  id: string;
  clientId: string | null;
  clientName: string | null;

  consultantId: string;
  consultantName: string | null;

  /** ISO8601 string, e.g. 2025-09-23T15:30:00.000Z (UTC) */
  startISO: string;

  /** duration in minutes */
  durationMin: number;

  /** e.g. AVAILABLE/CONFIRMED/… if you store a status per appt */
  status: string | null;

  /** optional type name (exam, follow-up, etc.) */
  typeName?: string | null;
};

/** Day (single) payload used by Day view */
export type DayPayload = {
  /** yyyy-mm-dd */
  dateISO: string;
  consultants: Consultant[];
  appointments: Appt[];
};

/** One day entry inside a week payload */
export type WeekDay = {
  /** yyyy-mm-dd */
  dateISO: string;
  appointments: Appt[];
};

/** Week payload (Mon–Sun or Sun–Sat depending on how you build it) */
export type WeekPayload = {
  /** Monday (or your chosen start) in yyyy-mm-dd */
  startISO: string;

  /** The days of the week with their appts */
  days: WeekDay[];

  /** Your active consultants for the week header (optional in render) */
  consultants: Consultant[];
};


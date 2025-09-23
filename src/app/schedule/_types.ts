/* src/app/schedule/_types.ts */

export type Consultant = {
  id: string;
  name: string | null;
};

export type Appt = {
  id: string;
  clientId: string;
  clientName: string;
  consultantId: string | null;
  consultantName: string | null;
  startISO: string;      // ISO8601 UTC
  durationMin: number;
  status: string;        // AppointmentStatus as string
  typeName?: string | null; // from ApptType.name if present
};

export type DayPayload = {
  dateISO: string; // yyyy-mm-dd
  consultants: Consultant[];
  appointments: Appt[];
};

export type WeekDay = {
  dateISO: string;       // yyyy-mm-dd
  appointments: Appt[];
};

export type WeekPayload = {
  startISO: string;      // monday yyyy-mm-dd
  days: WeekDay[];
  consultants: Consultant[];
};
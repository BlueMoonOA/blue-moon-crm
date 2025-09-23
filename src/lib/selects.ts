// src/lib/selects.ts
import type { Prisma } from "@prisma/client";

/** Fields used by the Quick View header/summary. */
export const clientSelect = {
  id: true,
  accountNumber: true, // <-- your schema's string field
  name: true,
  address1: true,
  address2: true,
  city: true,
  state: true,
  zip: true,
  workPhone1: true,
  workPhone2: true,
  fax: true,
  otherPhone: true,
  emails: true,       // string[]
  alert: true,
  balanceCents: true,
} as const satisfies Prisma.ClientSelect;

export type ClientRow = Prisma.ClientGetPayload<{ select: typeof clientSelect }>;

/** Fields for Upcoming/Previous tables on Quick View. */
export const apptSelect = {
  id: true,
  startAt: true,          // matches your Appointment model
  durationMin: true,
  type: true,
  status: true,
  consultant: { select: { name: true } },
} as const satisfies Prisma.AppointmentSelect;

export type ApptRow = Prisma.AppointmentGetPayload<{ select: typeof apptSelect }>;


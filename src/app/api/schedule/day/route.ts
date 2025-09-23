/* src/app/api/schedule/day/route.ts */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { DayPayload, Appt, Consultant } from "@/app/schedule/_types";

function ymd(input?: string | null): string {
  const now = new Date();
  if (!input) return now.toISOString().slice(0, 10);
  // basic validation
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  // fallback
  return new Date(input).toISOString().slice(0, 10);
}
function startOfDayUTC(isoYmd: string): Date { return new Date(`${isoYmd}T00:00:00.000Z`); }
function endOfDayUTC(isoYmd: string): Date { return new Date(`${isoYmd}T23:59:59.999Z`); }

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const date = ymd(url.searchParams.get("date"));
    const consultantId = url.searchParams.get("consultantId");

    const start = startOfDayUTC(date);
    const end = endOfDayUTC(date);

    const where: any = { startAt: { gte: start, lte: end } };
    if (consultantId) where.consultantId = consultantId;

    const appts = await prisma.appointment.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        consultant: { select: { id: true, name: true } },
        appointmentType: { select: { name: true } },
      },
      orderBy: [{ startAt: "asc" }],
    });

    const out: Appt[] = appts.map((a) => ({
      id: a.id,
      clientId: a.client.id,
      clientName: a.client.name,
      consultantId: a.consultantId,
      consultantName: a.consultant?.name ?? null,
      startISO: a.startAt.toISOString(),
      durationMin: a.durationMin,
      status: a.status,
      typeName: a.appointmentType?.name ?? null,
    }));

    // consultants visible in the filter (those who have *any* appointment in DB)
    const consultantsRaw = await prisma.user.findMany({
      where: { appointments: { some: {} } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    const consultants: Consultant[] = consultantsRaw;

    const payload: DayPayload = {
      dateISO: date,
      consultants,
      appointments: out,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "day failed" }, { status: 500 });
  }
}
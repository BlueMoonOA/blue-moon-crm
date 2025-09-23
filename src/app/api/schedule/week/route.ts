/* src/app/api/schedule/week/route.ts */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { WeekPayload, WeekDay, Appt, Consultant } from "@/app/schedule/_types";

function ymd(input?: string | null): string {
  const now = new Date();
  if (!input) return now.toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  return new Date(input).toISOString().slice(0, 10);
}
function startOfDayUTC(isoYmd: string): Date { return new Date(`${isoYmd}T00:00:00.000Z`); }
function addDays(isoYmd: string, d: number): string {
  const dt = new Date(`${isoYmd}T00:00:00.000Z`);
  dt.setUTCDate(dt.getUTCDate() + d);
  return dt.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const start = ymd(url.searchParams.get("start")); // Monday (or any day; we take 7 days)
    const consultantId = url.searchParams.get("consultantId");

    const startDate = startOfDayUTC(start);
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 7); // open interval [start, start+7)

    const where: any = { startAt: { gte: startDate, lt: endDate } };
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

    const mapped: Appt[] = appts.map((a) => ({
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

    // split into 7 days
    const days: WeekDay[] = [];
    for (let i = 0; i < 7; i++) {
      const dayISO = addDays(start, i);
      const beg = new Date(`${dayISO}T00:00:00.000Z`).getTime();
      const end = new Date(`${dayISO}T23:59:59.999Z`).getTime();
      const ap = mapped.filter((m) => {
        const t = new Date(m.startISO).getTime();
        return t >= beg && t <= end;
      });
      days.push({ dateISO: dayISO, appointments: ap });
    }

    const consultantsRaw = await prisma.user.findMany({
      where: { appointments: { some: {} } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    const consultants: Consultant[] = consultantsRaw;

    const payload: WeekPayload = {
      startISO: start,
      days,
      consultants,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "week failed" }, { status: 500 });
  }
}
// src/app/api/schedule/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// helper: start/end of day/week
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay(); // 0=Sun
  const diff = day === 0 ? 0 : day; // Sun-based week; change if Mon-based
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfWeek(d: Date) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const view = (searchParams.get("view") || "daily").toLowerCase(); // 'daily' | 'weekly'
    const consultantId = searchParams.get("consultantId") || undefined;

    const baseDate = new Date(dateStr);

    const range =
      view === "weekly"
        ? { start: startOfWeek(baseDate), end: endOfWeek(baseDate) }
        : { start: startOfDay(baseDate), end: endOfDay(baseDate) };

    const where: any = {
      startAt: { gte: range.start, lte: range.end },
    };
    if (consultantId) where.consultantId = consultantId;

    const appts = await prisma.appointment.findMany({
      where,
      orderBy: [{ startAt: "asc" }],
      select: {
        id: true,
        startAt: true,
        durationMin: true,
        status: true,
        type: true,
        notes: true,
        client: { select: { name: true } },
        consultant: { select: { id: true, name: true, email: true } },
      },
    });

    // Build consultant columns (distinct by consultant present in appts)
    const consultantsMap = new Map<string, { id: string; name: string; email: string | null }>();
    for (const a of appts) {
      if (a.consultant) {
        consultantsMap.set(a.consultant.id, {
          id: a.consultant.id,
          name: a.consultant.name || "Unnamed",
          email: a.consultant.email || null,
        });
      }
    }
    const consultants = [...consultantsMap.values()];

    return NextResponse.json({
      view,
      date: dateStr,
      range,
      consultants,
      appointments: appts.map((a) => ({
        id: a.id,
        startAt: a.startAt,
        durationMin: a.durationMin,
        status: a.status,
        type: a.type,
        notes: a.notes,
        clientName: a.client?.name ?? "—",
        consultantId: a.consultant?.id ?? null,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to load schedule" }, { status: 500 });
  }
}

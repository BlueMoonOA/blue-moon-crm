import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const rows = await prisma.lead.findMany({
      where: { clientId: id },
      orderBy: [{ createdAt: "desc" }],
    });
    return NextResponse.json({ ok:true, items: rows });
  } catch (err:any) {
    console.error("GET leads error", err);
    return NextResponse.json({ ok:false, error:"Server error" }, { status:500 });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const b = await req.json();

    const statusRaw = String(b.status || "").toUpperCase().replace(/\s+/g,"_");
    const status = (statusRaw in LeadStatus) ? (statusRaw as LeadStatus) : LeadStatus.NEW;

    const created = await prisma.lead.create({
      data: {
        clientId: id,
        name: (b.name ?? "").toString().trim() || "Untitled",
        company: b.company ?? null,
        email: b.email ?? null,
        phone: b.phone ?? null,
        source: b.source ?? null,
        status,
        score: typeof b.score === "number" ? b.score : null,
        needs: b.needs ?? null,
        budgetTimeframe: b.budgetTimeframe ?? null,
      },
    });

    return NextResponse.json({ ok:true, item: created });
  } catch (err:any) {
    console.error("POST lead error", err);
    return NextResponse.json({ ok:false, error: err?.message || "Create failed" }, { status:500 });
  }
}
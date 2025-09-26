import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DealStage, DealLossReason } from "@prisma/client";

function toCents(x:any) {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const rows = await prisma.deal.findMany({
      where: { clientId: id },
      orderBy: [{ createdAt: "desc" }],
    });
    return NextResponse.json({ ok:true, items: rows });
  } catch (err:any) {
    console.error("GET deals error", err);
    return NextResponse.json({ ok:false, error:"Server error" }, { status:500 });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const b = await req.json();

    const stageRaw = String(b.stage || "").toUpperCase().replace(/\s+/g,"_");
    const stage = (stageRaw in DealStage) ? (stageRaw as DealStage) : DealStage.NEW;

    const lossRaw = b.lossReason ? String(b.lossReason).toUpperCase().replace(/\s+/g,"_") : null;
    const lossReason = lossRaw && (lossRaw in DealLossReason) ? (lossRaw as DealLossReason) : null;

    const decisionMakers: string[] = Array.isArray(b.decisionMakers)
      ? b.decisionMakers
      : (String(b.decisionMakers||"").split(/[,\s;]+/).map((s:string)=>s.trim()).filter(Boolean));

    const created = await prisma.deal.create({
      data: {
        clientId: id,
        title: (b.title ?? "").toString().trim() || "Untitled",
        value: toCents(b.value),      // UI sends dollars; store cents in Deal.value (Int)
        stage,
        leadId: b.leadId ?? null,
        contactId: b.contactId ?? null,
        probability: typeof b.probability === "number" ? b.probability : null,
        decisionMakers,
        lossReason,
        lossNotes: b.lossNotes ?? null,
        closedAt: b.closedAt ? new Date(b.closedAt) : null,
      },
    });

    return NextResponse.json({ ok:true, item: created });
  } catch (err:any) {
    console.error("POST deal error", err);
    return NextResponse.json({ ok:false, error: err?.message || "Create failed" }, { status:500 });
  }
}
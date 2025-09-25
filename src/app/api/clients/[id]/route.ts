import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// normalize emails input into lowercased array
function parseEmails(input?: string | string[] | null): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(e => (e || "").trim().toLowerCase()).filter(Boolean);
  return (input as string)
    .split(/[,\s;]+/)
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const c = await prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        accountNumber: true,
        companyName: true,
        address1: true, address2: true, city: true, state: true, zip: true,
        workPhone1: true, workPhone2: true, cell: true, fax: true,
        emails: true,
        preferredContact: true,
        primaryConsultant: true,
        alert: true,
        notes: true,
        balanceCents: true,
      }
    });
    if (!c) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, client: c });
  } catch (err: any) {
    console.error("GET client error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { id } = await params;

    const data: any = {
      companyName: (body.companyName ?? "").trim() || null,
      address1: body.address1 ?? null,
      address2: body.address2 ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      zip: body.zip ?? null,
      workPhone1: (body.workPhone1 ?? null) || null,
      workPhone2: (body.workPhone2 ?? null) || null,
      cell: (body.cell ?? null) || null,
      fax: (body.fax ?? null) || null,
      emails: parseEmails(body.emails ?? body.email),
      preferredContact: (body.preferredContact ?? null) || null,
      primaryConsultant: (body.primaryConsultant ?? null) || null,
      alert: (body.alert ?? null) || null,
      notes: (body.notes ?? null) || null,
    };

    const updated = await prisma.client.update({
      where: { id },
      data,
      select: { id: true }
    });

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (err: any) {
    console.error("PUT client error", err);
    return NextResponse.json({ ok: false, error: err?.message || "Update failed" }, { status: 500 });
  }
}
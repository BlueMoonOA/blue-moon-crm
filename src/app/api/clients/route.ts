import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PreferredContact } from "@prisma/client";

function sanitizeEmails(input?: string): string[] {
  if (!input) return [];
  return input
    .split(/[,\s;]+/).map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

function genAccountNumber(name: string) {
  // Simple: first 3 letters + time suffix (unique enough for dev; uniqueness enforced in DB)
  const base = (name || "ACC").replace(/[^A-Za-z0-9]/g,"").toUpperCase().slice(0,6) || "ACC";
  const suffix = Date.now().toString().slice(-6);
  return `${base}-${suffix}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const companyName = (body.companyName || "").toString().trim();
    if (!companyName) {
      return NextResponse.json({ ok:false, error:"companyName is required" }, { status:400 });
    }

    // PreferredContact enum guard (optional)
    let preferredContact: PreferredContact | null = null;
    if (body.preferredContact) {
      const pc = String(body.preferredContact).toUpperCase().replace(/\s+/g, "_");
      if (pc in PreferredContact) preferredContact = pc as PreferredContact;
    }

    // Handle accountNumber (required & unique in schema)
    let accountNumber = (body.accountNumber || "").toString().trim();
    if (!accountNumber) {
      accountNumber = genAccountNumber(companyName);
    }

    // Normalize emails
    const emails = Array.isArray(body.emails) ? body.emails : sanitizeEmails(body.emails);

    const created = await prisma.client.create({
      data: {
        accountNumber,
        companyName,
        name: body.name ?? null,
        address1: body.address1 ?? null,
        address2: body.address2 ?? null,
        city: body.city ?? null,
        state: body.state ?? null,
        zip: body.zip ?? null,
        workPhone1: body.workPhone1 ?? null,
        workPhone2: body.workPhone2 ?? null,
        fax: body.fax ?? null,
        otherPhone: body.otherPhone ?? null,
        cell: body.cell ?? null,
        emails,
        preferredContact,
        primaryConsultant: body.primaryConsultant ?? null,
        specialty: body.specialty ?? null,
        secondary: body.secondary ?? null,
        alert: body.alert ?? null,
        notes: body.notes ?? null,
        balanceCents: typeof body.balanceCents === "number" ? body.balanceCents : 0,
        bill_address1: body.bill_address1 ?? null,
        bill_address2: body.bill_address2 ?? null,
        bill_city: body.bill_city ?? null,
        bill_state: body.bill_state ?? null,
        bill_zip: body.bill_zip ?? null,
      },
    });

    return NextResponse.json({ ok:true, item: created });
  } catch (err: any) {
    console.error("POST /api/clients error", err);
    return NextResponse.json({ ok:false, error: err?.message || "Server error" }, { status:500 });
  }
}
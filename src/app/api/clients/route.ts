import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toDigits(s?: string | null): string | null {
  if (!s) return null;
  const d = ("" + s).replace(/\D+/g, "");
  return d || null;
}

async function generateUniqueAccountNumber(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const head = Math.floor(Math.random() * 9) + 1;
    const tail = Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, "0");
    const candidate = `${head}${tail}`;
    const clash = await prisma.client.findFirst({
      where: { accountNumber: candidate },
      select: { id: true },
    });
    if (!clash) return candidate;
  }
  return String(Date.now()).slice(-10);
}

function parseEmails(input?: string | string[] | null): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((e) => (e || "").trim().toLowerCase()).filter(Boolean);
  }
  return (input as string)
    .split(/[,\s;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const companyName = (body.companyName ?? "").trim();
    if (!companyName) {
      return NextResponse.json({ ok: false, error: "Company Name is required" }, { status: 400 });
    }

    // soft-unique by companyName
    const exists = await prisma.client.findFirst({
      where: { companyName },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "Client with this Company Name already exists." },
        { status: 409 }
      );
    }

    // PreferredContact enum mapping (default WORK1)
    const pcRaw = (body.preferredContact ?? "WORK1").toString().toUpperCase();
    const pref = ["WORK1","WORK2","CELL","EMAIL","FAX","OTHER"].includes(pcRaw) ? pcRaw : "WORK1";

    const created = await prisma.client.create({
      data: {
        accountNumber: await generateUniqueAccountNumber(),
        companyName,
        name: companyName, // keep legacy field in sync for now

        address1: body.address1 ?? null,
        address2: body.address2 ?? null,
        city: body.city ?? null,
        state: body.state ?? null,
        zip: body.zip ?? null,

        workPhone1: toDigits(body.workPhone1),
        workPhone2: toDigits(body.workPhone2),
        cell:       toDigits(body.cell),
        fax:        toDigits(body.fax),

        emails: parseEmails(body.emails ?? body.email),

        preferredContact: pref as any,
        primaryConsultant: body.primaryConsultant ?? null,

        alert: body.alert ?? null,
        // notes: body.notes ?? null, // optional
      },
      select: { id: true, companyName: true, accountNumber: true },
    });

    return NextResponse.json({ ok: true, client: created }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/clients error:", err);
    return NextResponse.json({ ok: false, error: err?.message || "Create failed" }, { status: 500 });
  }
}

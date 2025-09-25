import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function randomAccountNumber(): string {
  // 10-digit number with a non-zero first digit
  const head = Math.floor(Math.random() * 9) + 1;
  const tail = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, "0");
  return `${head}${tail}`;
}

export async function POST() {
  try {
    // Seed payload from your message
    const payload = {
      companyName: "Abby Normal Optometery",
      address1: "123 Frankenstein Ln.",
      city: "Austin",
      state: "TX",
      zip: "78729",
      work1: "512 111-2222",
      work2: "512 222-3333",
      preferredContact: "Work # 1",
      accountNumber: randomAccountNumber(),
      primaryConsultant: "Adam Roscher",
      alert: "Has a Hump",
    };

    // Upsert by unique companyName (adjust if your schema uses a different unique)
    const upserted = await prisma.client.upsert({
      where: { companyName: payload.companyName },
      update: {
        ...payload,
      },
      create: {
        ...payload,
      },
      select: {
        id: true,
        companyName: true,
        accountNumber: true,
      },
    });

    return NextResponse.json(
      { ok: true, client: upserted },
      { status: 200 }
    );
  } catch (err) {
    console.error("seed-demo-client error", err);
    return NextResponse.json({ ok: false, error: "Seed failed" }, { status: 500 });
  }
}

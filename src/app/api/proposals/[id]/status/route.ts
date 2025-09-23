import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const ALLOWED = ["SENT","ACCEPTED","REJECTED","EXPIRED"] as const;
type Allowed = (typeof ALLOWED)[number];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const raw = body?.status as string | undefined;
    if (!raw) return NextResponse.json({ message: "status is required" }, { status: 400 });
    const status = raw.toUpperCase() as Allowed;
    if (!ALLOWED.includes(status)) return NextResponse.json({ message: "invalid status" }, { status: 400 });

    const updated = await prisma.proposal.update({
      where: { id: params.id },
      data: { status },
      select: { id: true, status: true, updatedAt: true },
    });
    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
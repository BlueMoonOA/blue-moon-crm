import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteStored } from "@/lib/uploads";

export async function PATCH(req: Request, { params }: { params:{fileId:string} }) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const allowed = ["displayName","description","ext","fileDate","contentType"] as const;
    const data: Record<string, any> = {};
    for (const k of allowed) if (k in body && body[k] !== undefined) data[k] = body[k];
    const updated = await prisma.clientFile.update({
      where: { id: params.fileId },
      data,
      select: { id:true, displayName:true, description:true, ext:true, fileDate:true, contentType:true }
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params:{fileId:string} }) {
  const row = await prisma.clientFile.findUnique({ where: { id: params.fileId } });
  if (!row) return NextResponse.json({ ok: true });
  await deleteStored(row.storedName);
  await prisma.clientFile.delete({ where: { id: row.id } });
  return NextResponse.json({ ok: true });
}
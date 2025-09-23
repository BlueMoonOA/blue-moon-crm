// src/app/api/clients/[id]/files/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeExt, contentTypeForExt, makeStoredName, saveUploaded } from "@/lib/uploads";

/** multipart/form-data: file, displayName?, description?, fileDate? */
export async function POST(req: Request, { params }: { params:{id:string} }) {
  try {
    const form = await req.formData();

    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const clientId = params.id;
    const displayName = (form.get("displayName") as string) || file.name || "file";
    const ext = safeExt(displayName) || safeExt(file.name) || "bin";
    const contentType = file.type || contentTypeForExt(ext);
    const storedName = makeStoredName(ext);

    // NOTE: prisma expects bytes:number — extract just 'bytes'
    const { bytes } = await saveUploaded(file, storedName);

    const description = (form.get("description") as string) || null;
    const fileDateStr = (form.get("fileDate") as string) || new Date().toISOString();
    const fileDate = new Date(fileDateStr);

    const created = await prisma.clientFile.create({
      data: { clientId, storedName, displayName, ext, contentType, description, fileDate, bytes },
      select: { id:true, displayName:true, ext:true, contentType:true, description:true, fileDate:true }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
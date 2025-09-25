// src/app/api/clients/[id]/files/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeExt, contentTypeForExt, makeStoredName, saveUploaded } from "@/lib/uploads";

// Keep dynamic if you want this to always run server-side; no `as const`.
export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds (optional)

/**
 * POST /api/clients/[id]/files
 * multipart/form-data:
 *   - file (File, required)
 *   - displayName? (string)
 *   - description? (string)
 *   - fileDate? (ISO string)
 */
export async function POST(
  req: Request,
  context: { params: { id: string } } // <- plain context object (no destructuring)
) {
  try {
    const clientId = context.params.id;
    if (!clientId) {
      return NextResponse.json({ error: "Missing client id" }, { status: 400 });
    }

    const form = await req.formData();

    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const displayName =
      (form.get("displayName") as string | null) ?? file.name ?? "file";

    const ext = safeExt(displayName || "") || safeExt(file.name || "") || "bin";
    const contentType = file.type || contentTypeForExt(ext);
    const storedName = makeStoredName(ext);

    // saveUploaded returns { bytes, ... }
    const { bytes } = await saveUploaded(file, storedName);

    const description = (form.get("description") as string | null) ?? null;

    const fileDateStr =
      (form.get("fileDate") as string | null) ?? new Date().toISOString();
    const fileDate = new Date(fileDateStr);

    const created = await prisma.clientFile.create({
      data: {
        clientId,
        storedName,
        displayName,
        ext,
        contentType,
        description,
        fileDate,
        bytes,
      },
      select: {
        id: true,
        displayName: true,
        ext: true,
        contentType: true,
        description: true,
        fileDate: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}



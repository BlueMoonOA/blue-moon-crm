import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const fp = path.join(process.cwd(), "public", "client-photos", `${id}.jpg`);
    await writeFile(fp, bytes);

    return NextResponse.json({ ok: true, path: `/client-photos/${id}.jpg` });
  } catch (e:any) {
    console.error("photo upload error", e);
    return NextResponse.json({ ok: false, error: e?.message || "Upload failed" }, { status: 500 });
  }
}
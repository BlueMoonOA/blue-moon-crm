# fix-schedule-pack2.ps1  minimal, no helper funcs

$ErrorActionPreference = "Stop"

# Ensure folders exist
foreach ($p in @("src/lib","src/app/api/proposals/[id]/status","src/app/api/files","prisma")) {
  if (-not (Test-Path $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null }
}

# 1) src/lib/prisma.ts
[IO.File]::WriteAllText("src/lib/prisma.ts", @"
import { PrismaClient } from "@prisma/client";
declare global { var prisma: PrismaClient | undefined }
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
export default prisma;
"@, [Text.UTF8Encoding]::new($false))

# 2) src/lib/uploads.ts
[IO.File]::WriteAllText("src/lib/uploads.ts", @"
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const uploadPath = path.join(process.cwd(), "public", "uploads");

export function safeExt(name: string | null): string | null {
  if (!name) return null;
  const m = /\.[a-z0-9]+$/i.exec(name);
  return m ? m[0].toLowerCase().replace(".", "") : null;
}

export function contentTypeForExt(ext: string | null): string {
  switch (ext) {
    case "pdf": return "application/pdf";
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    default: return "application/octet-stream";
  }
}

export async function saveBufferAs(buf: Buffer, storedName: string): Promise<number> {
  await fs.mkdir(uploadPath, { recursive: true });
  const full = path.join(uploadPath, storedName);
  await fs.writeFile(full, buf);
  return buf.length;
}

export async function saveUploaded(file: File, storedName: string): Promise<number> {
  const buf = Buffer.from(await file.arrayBuffer());
  return saveBufferAs(buf, storedName);
}

export async function deleteStored(storedName: string): Promise<void> {
  const full = path.join(uploadPath, storedName);
  try { await fs.unlink(full); } catch {}
}
"@, [Text.UTF8Encoding]::new($false))

# 3) proposals status PATCH (no enum import)
[IO.File]::WriteAllText("src/app/api/proposals/[id]/status/route.ts", @"
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
"@, [Text.UTF8Encoding]::new($false))

# 4) files POST route
[IO.File]::WriteAllText("src/app/api/files/route.ts", @"
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { saveUploaded, safeExt, contentTypeForExt } from "@/lib/uploads";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const clientId = (form.get("clientId") as string | null) ?? "";
    const displayName = (form.get("displayName") as string | null) ?? null;
    const description = (form.get("description") as string | null) ?? null;
    const fileDateStr = (form.get("fileDate") as string | null);

    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });
    if (!clientId) return NextResponse.json({ error: "Missing clientId" }, { status: 400 });

    const ext = safeExt(displayName) ?? (safeExt(file.name) ?? "bin");
    const contentType = file.type || contentTypeForExt(ext);
    const storedName = `${crypto.randomUUID()}.${ext}`;

    const bytes = await saveUploaded(file, storedName);
    const fileDate = fileDateStr ? new Date(fileDateStr) : new Date();

    const row = await prisma.clientFile.create({
      data: {
        clientId,
        storedName,
        displayName: displayName ?? file.name ?? storedName,
        ext,
        contentType,
        description: description ?? undefined,
        fileDate,
        bytes,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: row.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
"@, [Text.UTF8Encoding]::new($false))

Write-Host "Wrote prisma.ts, uploads.ts, proposals status route, files POST route." -ForegroundColor Green
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

/** Absolute folder used for binary storage (on disk) */
const ROOT = path.join(process.cwd(), "uploads");
async function ensureRoot() { await fs.mkdir(ROOT, { recursive: true }); }

/** Safe ext (no dot), or null */
export function safeExt(name: string | null): string | null {
  if (!name) return null;
  const ix = name.lastIndexOf(".");
  if (ix <= 0 || ix === name.length - 1) return null;
  const ext = name.slice(ix + 1).toLowerCase().replace(/[^a-z0-9]/g, "");
  return ext || null;
}

const CT: Record<string,string> = {
  pdf:"application/pdf", png:"image/png", jpg:"image/jpeg", jpeg:"image/jpeg",
  webp:"image/webp", gif:"image/gif", txt:"text/plain; charset=utf-8",
  csv:"text/csv", json:"application/json",
  doc:"application/msword",
  docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
export function contentTypeForExt(ext: string | null): string {
  if (!ext) return "application/octet-stream";
  return CT[ext.toLowerCase()] ?? "application/octet-stream";
}

/** Stored filename (uuid + sanitized ext) */
export function makeStoredName(ext: string | null): string {
  const e = (ext ?? "bin").replace(/[^a-z0-9]/gi, "").toLowerCase();
  return `${crypto.randomUUID()}.${e || "bin"}`;
}

/** Persist a browser File under a stored name; returns { bytes, fullPath } */
export async function saveUploaded(
  file: File,
  storedName: string
): Promise<{ bytes: number; fullPath: string }> {
  await ensureRoot();
  const ab = await file.arrayBuffer();
  const buf = Buffer.from(ab);
  const fullPath = path.join(ROOT, storedName);
  await fs.writeFile(fullPath, buf);
  return { bytes: buf.length, fullPath };
}

/** Delete by absolute path or stored name */
export async function deleteStored(fullOrName: string): Promise<void> {
  await ensureRoot();
  const fullPath = path.isAbsolute(fullOrName) ? fullOrName : path.join(ROOT, fullOrName);
  try { await fs.unlink(fullPath); } catch { /* ignore */ }
}
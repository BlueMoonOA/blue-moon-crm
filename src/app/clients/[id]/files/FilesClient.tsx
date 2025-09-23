"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/** Server shape (Prisma dates) */
type ServerFile = {
  id: string;
  storedName: string;
  displayName: string;
  ext: string;
  contentType: string | null;
  description: string | null;
  fileDate: Date | null;
  bytes: number | null;
  createdAt: Date;
};

/** Client shape (string dates) */
type ClientFile = {
  id: string;
  storedName?: string;
  displayName: string;
  ext: string;
  contentType: string | null;
  description: string | null;
  fileDate: string | null;   // ISO or null
  bytes?: number | null;
  createdAt?: string;        // ISO
};

type Props = {
  clientId: string;
  files?: ServerFile[] | ClientFile[];
  initialFiles?: ServerFile[] | ClientFile[];
};

function toISO(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  if (typeof d === "string") {
    const tryDate = new Date(d);
    return isNaN(tryDate.getTime()) ? null : tryDate.toISOString();
  }
  try { return new Date(d).toISOString(); } catch { return null; }
}

function normalize(files: Array<ServerFile | ClientFile> | undefined): ClientFile[] {
  if (!files) return [];
  return files.map((f) => ({
    id: f.id,
    storedName: (f as any).storedName,
    displayName: f.displayName,
    ext: f.ext,
    contentType: f.contentType ?? null,
    description: f.description ?? null,
    fileDate: toISO((f as ServerFile).fileDate ?? (f as ClientFile).fileDate ?? null),
    bytes: (f as any).bytes ?? null,
    createdAt: toISO((f as ServerFile).createdAt ?? (f as ClientFile).createdAt) ?? undefined,
  }));
}

// compact button styles
const btn =
  "inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-800 " +
  "hover:bg-zinc-50 active:bg-zinc-100 shadow-sm px-3 py-1 text-sm";
const btnPrimary =
  "inline-flex items-center justify-center rounded-md bg-blue-600 text-white " +
  "hover:bg-blue-700 active:bg-blue-800 shadow-sm px-3 py-1 text-sm";
const btnDanger =
  "inline-flex items-center justify-center rounded-md border border-red-300 text-red-600 " +
  "bg-white hover:bg-red-50 active:bg-red-100 shadow-sm px-3 py-1 text-sm";

/** Simple headless Modal */
function Modal({
  open,
  title,
  children,
  onClose,
  onSubmit,
  submitLabel = "Save",
  destructive = false,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  destructive?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="border-b px-4 py-3">
          <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
        </div>
        <div className="px-4 py-3">{children}</div>
        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <button className={btn} onClick={onClose}>Cancel</button>
          {onSubmit && (
            <button
              className={destructive ? btnDanger : btnPrimary}
              onClick={onSubmit}
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FilesClient({ clientId, files, initialFiles }: Props) {
  // normalize incoming
  const start = normalize(files ?? initialFiles ?? []);
  const [list, setList] = useState<ClientFile[]>(start);

  // selection
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => list.find((f) => f.id === selectedId) ?? null,
    [list, selectedId]
  );

  // upload plumbing
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scanInputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const triggerAdd = () => fileInputRef.current?.click();
  const triggerScan = () => scanInputRef.current?.click();

  async function uploadPicked(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`/api/clients/${clientId}/files`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text().catch(() => `Upload failed (${res.status})`));

      const created = await res.json() as {
        id: string;
        displayName: string;
        ext: string;
        contentType: string | null;
        description: string | null;
        fileDate: string | null;
      };

      const clientRow: ClientFile = {
        id: created.id,
        displayName: created.displayName,
        ext: created.ext,
        contentType: created.contentType ?? null,
        description: created.description ?? null,
        fileDate: created.fileDate ? toISO(created.fileDate) : null,
      };

      setList((prev) => [clientRow, ...prev]);
      setSelectedId(created.id);
    } finally {
      setBusy(false);
    }
  }

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;
    try {
      await uploadPicked(file);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  const onPickScan: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;
    try {
      await uploadPicked(file);
    } catch (err) {
      console.error(err);
      alert("Scan upload failed.");
    }
  };

  // ---- PATCH helper ----
  async function patchSelected(data: Partial<Pick<ClientFile, "displayName"|"description"|"ext"|"fileDate">> & { contentType?: string | null }) {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/files/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => `Update failed (${res.status})`));

      const updated = await res.json() as {
        id: string;
        displayName: string;
        description: string | null;
        ext: string;
        fileDate: string | null;
        contentType: string | null;
      };

      setList((prev) =>
        prev.map((f) =>
          f.id === selected.id
            ? {
                ...f,
                displayName: updated.displayName,
                description: updated.description,
                ext: updated.ext,
                fileDate: updated.fileDate ? toISO(updated.fileDate) : null,
                contentType: updated.contentType ?? null,
              }
            : f
        )
      );
    } finally {
      setBusy(false);
    }
  }

  // ---- Modal state ----
  type ModalKind = null | "name" | "desc" | "type" | "date" | "delete";
  const [modal, setModal] = useState<ModalKind>(null);

  // Local form values
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState("");
  const [formDate, setFormDate] = useState(""); // yyyy-mm-dd

  // Openers
  const openName = () => {
    if (!selected) return;
    setFormName(selected.displayName ?? "");
    setModal("name");
  };
  const openDesc = () => {
    if (!selected) return;
    setFormDesc(selected.description ?? "");
    setModal("desc");
  };
  const openType = () => {
    if (!selected) return;
    setFormType(selected.ext ?? "");
    setModal("type");
  };
  const openDate = () => {
    if (!selected) return;
    const cur = selected.fileDate ? new Date(selected.fileDate).toISOString().slice(0,10) : "";
    setFormDate(cur);
    setModal("date");
  };
  const openDelete = () => {
    if (!selected) return;
    setModal("delete");
  };

  // Submitters
  const submitName = async () => {
    const next = formName.trim();
    await patchSelected({ displayName: next });
    setModal(null);
  };
  const submitDesc = async () => {
    const next = formDesc.trim();
    await patchSelected({ description: next.length ? next : null });
    setModal(null);
  };
  const submitType = async () => {
    const ext = formType.trim().replace(/^\.+/, "").toLowerCase();
    if (!ext) return alert("Extension cannot be empty.");
    await patchSelected({ ext });
    setModal(null);
  };
  const submitDate = async () => {
    const v = formDate.trim();
    if (!v) {
      await patchSelected({ fileDate: null });
      setModal(null);
      return;
    }
    const t = Date.parse(v);
    if (isNaN(t)) return alert("Invalid date. Use YYYY-MM-DD.");
    await patchSelected({ fileDate: new Date(t).toISOString() });
    setModal(null);
  };
  const submitDelete = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/files/${selected.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text().catch(() => `Delete failed (${res.status})`));
      setList((prev) => prev.filter((f) => f.id !== selected.id));
      setSelectedId(null);
    } finally {
      setBusy(false);
      setModal(null);
    }
  };

  return (
    <div>
      {/* Hidden inputs used by upload buttons */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.csv,.json"
        onChange={onPickFile}
      />
      <input
        ref={scanInputRef}
        type="file"
        className="hidden"
        accept="application/pdf,image/*"
        onChange={onPickScan}
      />

      {/* Single compact row of controls */}
      <div className="mb-3 flex flex-wrap gap-3">
        <button className={btn} onClick={triggerScan} disabled={busy}>Add Scanned Document</button>
        <button className={btn} onClick={openType} disabled={!selected || busy}>Edit File Type</button>
        <button className={btn} onClick={openDesc} disabled={!selected || busy}>Edit Description</button>
        <button className={btn} onClick={openName} disabled={!selected || busy}>Edit File Name</button>
        <button className={btn} onClick={openDate} disabled={!selected || busy}>Edit Date</button>
        <button className={btnDanger} onClick={openDelete} disabled={!selected || busy}>Remove File</button>
        <button className={btnPrimary} onClick={triggerAdd} disabled={busy}>
          {busy ? "Working…" : "Add File"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border text-left">Date</th>
              <th className="p-2 border text-left">Filename</th>
              <th className="p-2 border text-left">Type</th>
              <th className="p-2 border text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td className="p-2 border" colSpan={4}>No files.</td></tr>
            ) : (
              list.map((f) => (
                <tr
                  key={f.id}
                  className={`cursor-pointer ${selectedId === f.id ? "bg-blue-50" : ""}`}
                  onClick={() => setSelectedId(f.id)}
                >
                  <td className="p-2 border">
                    {f.fileDate ? new Date(f.fileDate).toLocaleDateString() : ""}
                  </td>
                  <td className="p-2 border">{f.displayName}</td>
                  <td className="p-2 border">{f.ext?.toUpperCase()}</td>
                  <td className="p-2 border">{f.description ?? ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <Modal
        open={modal === "name"}
        title="Edit File Name"
        onClose={() => setModal(null)}
        onSubmit={submitName}
        submitLabel="Save"
      >
        <label className="block text-sm font-medium text-zinc-700 mb-1">Display name</label>
        <input
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="e.g. Insurance card.pdf"
        />
      </Modal>

      <Modal
        open={modal === "desc"}
        title="Edit Description"
        onClose={() => setModal(null)}
        onSubmit={submitDesc}
        submitLabel="Save"
      >
        <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
        <textarea
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={formDesc}
          onChange={(e) => setFormDesc(e.target.value)}
          placeholder="Optional notes about this file…"
        />
      </Modal>

      <Modal
        open={modal === "type"}
        title="Edit File Type"
        onClose={() => setModal(null)}
        onSubmit={submitType}
        submitLabel="Save"
      >
        <label className="block text-sm font-medium text-zinc-700 mb-1">Extension (no dot)</label>
        <input
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formType}
          onChange={(e) => setFormType(e.target.value)}
          placeholder="pdf, png, jpg…"
        />
      </Modal>

      <Modal
        open={modal === "date"}
        title="Edit File Date"
        onClose={() => setModal(null)}
        onSubmit={submitDate}
        submitLabel="Save"
      >
        <label className="block text-sm font-medium text-zinc-700 mb-1">Date</label>
        <input
          type="date"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formDate}
          onChange={(e) => setFormDate(e.target.value)}
        />
        <p className="mt-2 text-xs text-zinc-500">Leave empty to clear the date.</p>
      </Modal>

      <Modal
        open={modal === "delete"}
        title="Remove File"
        onClose={() => setModal(null)}
        onSubmit={submitDelete}
        submitLabel="Delete"
        destructive
      >
        <p className="text-sm text-zinc-700">
          This will permanently delete <strong>{selected?.displayName}</strong>.
        </p>
      </Modal>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Client = {
  id: string;
  companyName: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  workPhone1?: string | null;
  workPhone2?: string | null;
  cell?: string | null;
  fax?: string | null;
  emails?: string[];
  preferredContact?: "WORK1"|"WORK2"|"CELL"|"EMAIL"|"FAX"|"OTHER"|null;
  alert?: string | null;
  balanceCents?: number | null;
};

function Panel({ title, children, actions }:{
  title: string; children: React.ReactNode; actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-300 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-300 bg-slate-100 px-3 py-2">
        <div className="text-[13px] font-semibold tracking-tight text-slate-800">{title}</div>
        {actions}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function ClientOverview() {
  const params = useParams<{ id: string }>();
  const id = (params?.id as string) || "";
  const [c, setC] = useState<Client | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoVer, setPhotoVer] = useState(0); // cache-bust after upload

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await fetch(`/api/clients/${id}`);
        const j = await res.json();
        if (!res.ok || !j?.ok) throw new Error(j?.error || "Load failed");
        if (!abort) setC(j.client as Client);
      } catch (e: any) {
        if (!abort) setErr(e?.message || "Load failed");
      }
    })();
    return () => { abort = true; };
  }, [id]);

  const balance = useMemo(() => {
    const cents = c?.balanceCents ?? 0;
    return (cents/100).toLocaleString(undefined, { style: "currency", currency: "USD" });
  }, [c?.balanceCents]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      const res = await fetch(`/api/clients/${id}/photo`, { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Upload failed");
      setPhotoVer(v => v+1);
    } catch (e:any) {
      alert(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.currentTarget.value = "";
    }
  }

  if (err) return <div className="text-sm text-red-600">{err}</div>;
  if (!c) return <div className="text-sm text-slate-600">Loading…</div>;

  const pref = c.preferredContact ?? "—";
  const emails = (c.emails ?? []).join(", ") || "—";
  const phones: Array<[string, string | null | undefined]> = [
    ["Work #1", c.workPhone1],
    ["Work #2", c.workPhone2],
    ["Cell",    c.cell],
    ["Fax",     c.fax],
  ];

  const photoUrl = `/client-photos/${id}.jpg?ver=${photoVer}`;

  return (
    <div className="space-y-6">
      <Panel title="Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="text-[16px] font-semibold mb-2">{c.companyName ?? "—"}</div>
            <div>{c.address1 || "—"}</div>
            {c.address2 ? <div>{c.address2}</div> : null}
            <div>{[c.city, c.state].filter(Boolean).join(", ")} {c.zip || ""}</div>

            <div className="mt-3 text-[13px]">
              <div className="font-semibold">Phones</div>
              <ul className="mt-1 grid grid-cols-2 gap-x-6 gap-y-1">
                {phones.map(([label, val]) => (
                  <li key={label}>
                    <span className="text-slate-600">{label}:</span> {val || "—"}
                  </li>
                ))}
              </ul>
              <div className="mt-2"><span className="font-semibold">Preferred Contact:</span> {pref}</div>
              <div className="mt-2"><span className="font-semibold">Emails:</span> {emails}</div>
              <div className="mt-2"><span className="font-semibold">Balance:</span> {balance}</div>
              <div className="mt-2"><span className="font-semibold">Last Appt:</span> —</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {/* Photo (will 404 if not uploaded yet; use onError to hide) */}
            <img
              src={photoUrl}
              alt="Client"
              className="w-48 h-48 object-cover rounded-md border border-slate-300 bg-slate-50"
              onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.display="none"; }}
            />
            <label className="text-[12px]">
              <span className="rounded border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold hover:bg-slate-50 cursor-pointer">
                {uploading ? "Uploading…" : "Upload Photo"}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
            </label>
          </div>
        </div>
      </Panel>

      <Panel title="Alerts">
        <div className="text-[13px]">{c.alert?.trim() || "No alerts."}</div>
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="Upcoming Appointments">
          <div className="text-[13px] text-slate-600">No upcoming appointments.</div>
        </Panel>
        <Panel title="Previous Appointments">
          <div className="text-[13px] text-slate-600">No previous appointments.</div>
        </Panel>
      </div>
    </div>
  );
}
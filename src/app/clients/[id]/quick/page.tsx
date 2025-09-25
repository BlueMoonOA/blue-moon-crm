"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ClientTabs from "@/components/ClientTabs";

type Client = {
  id: string;
  companyName: string | null;
  address1?: string | null; city?: string | null; state?: string | null; zip?: string | null;
  workPhone1?: string | null; workPhone2?: string | null; cell?: string | null;
  emails?: string[];
  preferredContact?: string | null;
  primaryConsultant?: string | null;
  alert?: string | null;
};

export default function QuickView() {
  const { id } = useParams<{id: string}>();
  const [c, setC] = useState<Client | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let abort = false;
    async function run() {
      setLoading(true); setErr(null);
      try {
        const res = await fetch(`/api/clients/${id}`);
        const j = await res.json();
        if (!res.ok || !j?.ok) throw new Error(j?.error || "Load failed");
        if (!abort) setC(j.client);
      } catch (e: any) {
        if (!abort) setErr(e?.message || "Load failed");
      } finally {
        if (!abort) setLoading(false);
      }
    }
    if (id) run();
    return () => { abort = true; };
  }, [id]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <ClientTabs />
      <div className="rounded-md border border-slate-300 bg-white shadow-sm p-4">
        <h2 className="text-[16px] font-semibold mb-2">Quick View</h2>
        {loading ? <div className="text-sm text-slate-600">Loading…</div> :
         err ? <div className="text-sm text-red-600">{err}</div> :
         c ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div><div className="font-medium text-slate-500">Company</div>{c.companyName ?? "—"}</div>
            <div><div className="font-medium text-slate-500">Primary Consultant</div>{c.primaryConsultant ?? "—"}</div>
            <div><div className="font-medium text-slate-500">Preferred Contact</div>{c.preferredContact ?? "—"}</div>
            <div className="md:col-span-3"><div className="font-medium text-slate-500">Address</div>
              {[c.address1, c.city, c.state, c.zip].filter(Boolean).join(", ") || "—"}
            </div>
            <div><div className="font-medium text-slate-500">Work #1</div>{c.workPhone1 ?? "—"}</div>
            <div><div className="font-medium text-slate-500">Work #2</div>{c.workPhone2 ?? "—"}</div>
            <div><div className="font-medium text-slate-500">Cell</div>{c.cell ?? "—"}</div>
            <div className="md:col-span-3"><div className="font-medium text-slate-500">Emails</div>
              {(c.emails && c.emails.length) ? c.emails.join(", ") : "—"}
            </div>
            {c.alert ? (
              <div className="md:col-span-3 rounded bg-yellow-50 border border-yellow-200 p-2">
                <div className="font-medium text-yellow-800">Alert</div>
                <div className="text-yellow-900">{c.alert}</div>
              </div>
            ) : null}
          </div>
        ) : <div className="text-sm text-slate-600">No data.</div>}
      </div>
    </div>
  );
}

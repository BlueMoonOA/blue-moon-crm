"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Client = {
  id: string;
  companyName: string | null;
  address1?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  workPhone1?: string | null;
};

export default function ClientQuickView() {
  const params = useParams<{ id: string }>();
  const id = (params?.id as string) || "";

  const [data, setData] = useState<Client | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await fetch(`/api/clients/${id}`);
        const j = await res.json();
        if (!res.ok || !j?.ok) throw new Error(j?.error || "Not found");
        if (!abort) setData(j.client);
      } catch (e: any) {
        if (!abort) setErr(e?.message || "Error");
      }
    })();
    return () => { abort = true; };
  }, [id]);

  if (err) {
    return (
      <div className="rounded-md border border-slate-300 bg-white shadow-sm p-4 text-sm text-red-600">
        {err}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rounded-md border border-slate-300 bg-white shadow-sm p-4 text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-300 bg-white shadow-sm p-4 text-sm">
      <div className="text-base font-semibold mb-2">{data.companyName}</div>
      <div>{data.address1 || "—"}</div>
      <div>{[data.city, data.state].filter(Boolean).join(", ")} {data.zip || ""}</div>
      <div className="mt-2">Phone: {data.workPhone1 || "—"}</div>
    </div>
  );
}
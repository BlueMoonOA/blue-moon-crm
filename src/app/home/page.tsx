"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

/* --- small UI helpers --- */
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
function Labeled({ label, children }:{ label:string; children: React.ReactNode }) {
  return (
    <label className="block text-[12px]">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "h-9 w-full rounded border border-slate-300 bg-white px-2 text-[13px] outline-none " +
        "focus:border-slate-400 disabled:bg-slate-100 " +
        (props.className ?? "")
      }
    />
  );
}

/* -------- Create Client Modal -------- */
function CreateClientModal({ open, onClose }:{
  open: boolean;
  onClose: (createdId?: string)=>void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  const [form, setForm] = useState({
    companyName: "",
    address1: "",
    address2: "",
    city: "",
    state: "TX",
    zip: "",
    workPhone1: "",
    workPhone2: "",
    cell: "",
    emails: "", // comma/space/semicolon separated
    preferredContact: "WORK1",
    primaryConsultant: "Adam Roscher",
    alert: "",
  });

  async function create() {
    setErr(null);
    if (!form.companyName.trim()) {
      setErr("Company Name is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json();
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Create failed");
      const id = j.client?.id as string | undefined;
      onClose(id);
      if (id) router.push(`/clients/${id}`);
    } catch (e:any) {
      setErr(e?.message || "Create failed");
      setSubmitting(false);
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-md bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="text-[14px] font-semibold">Add New Client</div>
          <button onClick={()=>onClose()} className="text-[13px] text-slate-600 hover:text-slate-900">✕</button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
          <Labeled label="Company Name">
            <Input value={form.companyName} onChange={(e)=>setForm({...form, companyName:e.target.value})} />
          </Labeled>
          <Labeled label="Primary Consultant">
            <Input value={form.primaryConsultant} onChange={(e)=>setForm({...form, primaryConsultant:e.target.value})} />
          </Labeled>
          <Labeled label="Preferred Contact">
            <select
              className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-[13px] outline-none focus:border-slate-400"
              value={form.preferredContact}
              onChange={(e)=>setForm({...form, preferredContact:e.target.value})}
            >
              <option value="WORK1">Work # 1</option>
              <option value="WORK2">Work # 2</option>
              <option value="CELL">Cell</option>
              <option value="EMAIL">Email</option>
              <option value="FAX">Fax</option>
              <option value="OTHER">Other</option>
            </select>
          </Labeled>

          <Labeled label="Address 1">
            <Input value={form.address1} onChange={(e)=>setForm({...form, address1:e.target.value})} />
          </Labeled>
          <Labeled label="Address 2">
            <Input value={form.address2} onChange={(e)=>setForm({...form, address2:e.target.value})} />
          </Labeled>
          <div />

          <Labeled label="City">
            <Input value={form.city} onChange={(e)=>setForm({...form, city:e.target.value})} />
          </Labeled>
          <Labeled label="State">
            <select
              className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-[13px] outline-none focus:border-slate-400"
              value={form.state}
              onChange={(e)=>setForm({...form, state:e.target.value})}
            >
              {"AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY"
                .split(" ").map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </Labeled>
          <Labeled label="ZIP">
            <Input value={form.zip} onChange={(e)=>setForm({...form, zip:e.target.value})} />
          </Labeled>

          <Labeled label="Work # 1">
            <Input value={form.workPhone1} onChange={(e)=>setForm({...form, workPhone1:e.target.value})} />
          </Labeled>
          <Labeled label="Work # 2">
            <Input value={form.workPhone2} onChange={(e)=>setForm({...form, workPhone2:e.target.value})} />
          </Labeled>
          <Labeled label="Cell">
            <Input value={form.cell} onChange={(e)=>setForm({...form, cell:e.target.value})} />
          </Labeled>

          <Labeled label="Emails (comma/space/semicolon separated)">
            <Input
              placeholder="billing@example.com sales@example.com"
              value={form.emails}
              onChange={(e)=>setForm({...form, emails:e.target.value})}
            />
          </Labeled>

          <Labeled label="Alert (optional)">
            <Input value={form.alert} onChange={(e)=>setForm({...form, alert:e.target.value})} />
          </Labeled>
        </div>

        {err ? <div className="px-4 pb-2 text-[12px] text-red-600">{err}</div> : null}

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <button onClick={()=>onClose()} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-semibold hover:bg-slate-50">Cancel</button>
          <button
            onClick={create}
            disabled={submitting}
            className="rounded bg-[#172554] px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save Client"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------- Search + Signed-in shell -------- */
type Row = {
  id: string;
  name: string;
  address1: string;
  city: string;
  state: string;
  phone: string;
  lastAppt: string | null;
};

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession(); // NextAuth
  const [criteria, setCriteria] = useState<"phone"|"email"|"address"|"wildcard">("wildcard");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]|null>(null);
  const [loading, setLoading] = useState(false);

  const [openNew, setOpenNew] = useState(false);

  async function search() {
    if (!q.trim()) { setRows([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/search?criteria=${criteria}&query=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setRows(data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const table = useMemo(()=>(
    <div className="overflow-auto rounded border border-slate-300">
      <table className="min-w-full text-left text-[13px]">
        <thead className="bg-[#172554] text-white">
          <tr>
            <th className="px-3 py-2">Client / Office</th>
            <th className="px-3 py-2">Address</th>
            <th className="px-3 py-2">City</th>
            <th className="px-3 py-2">State</th>
            <th className="px-3 py-2">Phone</th>
            <th className="px-3 py-2">Last Appt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {(rows ?? []).length === 0 ? (
            <tr><td className="px-3 py-3 text-slate-500" colSpan={6}>No matches.</td></tr>
          ) : (
            rows!.map(r=>(
              <tr key={r.id} className="hover:bg-slate-50 cursor-pointer" onClick={()=>router.push(`/clients/${r.id}/overview`)}>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.address1}</td>
                <td className="px-3 py-2">{r.city}</td>
                <td className="px-3 py-2">{r.state}</td>
                <td className="px-3 py-2">{r.phone}</td>
                <td className="px-3 py-2">{r.lastAppt ?? "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  ), [rows, router]);

  const authButton = (
    status === "authenticated"
      ? <button onClick={() => signOut()} className="rounded bg-black px-3 py-1.5 text-[13px] font-semibold text-white">Sign out</button>
      : <button onClick={() => signIn()} className="rounded bg-black px-3 py-1.5 text-[13px] font-semibold text-white">Sign in</button>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold tracking-tight">Home</h1>
        <div className="flex items-center gap-2">
          <button onClick={()=>setOpenNew(true)} className="rounded bg-[#172554] px-3 py-1.5 text-[13px] font-semibold text-white">+ Add New Client</button>
          {authButton}
        </div>
      </div>

      <Panel
        title="Search"
        actions={
          <div className="flex items-center gap-2">
            <select
              className="h-8 rounded border border-slate-300 bg-white px-2 text-[12px] outline-none"
              value={criteria}
              onChange={(e)=>setCriteria(e.target.value as any)}
            >
              <option value="wildcard">Wildcard</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="address">Address</option>
            </select>
            <button onClick={search} className="rounded border border-slate-300 bg-white px-2 py-1 text-[12px] hover:bg-slate-50">GO</button>
          </div>
        }
      >
        <Input placeholder="Search text…" value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>{ if (e.key==="Enter") search(); }} />
        <div className="mt-3">{loading ? <div className="text-[12px] text-slate-500">Searching…</div> : table}</div>
      </Panel>

      <Panel title="Clients Signed-In">
        <div className="text-[13px] text-slate-500">No clients signed in. (Will list those flagged as “Signed-In” from Schedule.)</div>
      </Panel>

      <CreateClientModal open={openNew} onClose={(id)=>setOpenNew(false)} />
    </div>
  );
}



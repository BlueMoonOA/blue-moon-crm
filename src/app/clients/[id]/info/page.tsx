"use client";

// ✅ FULL CLIENT INFO PAGE (marker)
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
        "focus:border-slate-400 " + (props.className ?? "")
      }
    />
  );
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "min-h-[90px] w-full rounded border border-slate-300 bg-white p-2 text-[13px] outline-none " +
        "focus:border-slate-400 " + (props.className ?? "")
      }
    />
  );
}

type Client = {
  id: string;
  accountNumber?: string | null;
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
  emails: string[];
  preferredContact?: "WORK1"|"WORK2"|"CELL"|"EMAIL"|"FAX"|"OTHER"|null;
  primaryConsultant?: string | null;
  alert?: string | null;
  notes?: string | null;
  bill_address1?: string | null;
  bill_address2?: string | null;
  bill_city?: string | null;
  bill_state?: string | null;
  bill_zip?: string | null;
  balanceCents?: number | null;
  lastApptAt?: string | null;
};

export default function ClientInfoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  const [billingEnabled, setBillingEnabled] = useState(false);
  const [form, setForm] = useState<Client & { emailsText: string; }>({
    id: "",
    companyName: "",
    address1: "", address2: "", city: "", state: "TX", zip: "",
    workPhone1: "", workPhone2: "", cell: "", fax: "",
    emails: [], emailsText: "",
    preferredContact: "WORK1",
    primaryConsultant: "",
    alert: "", notes: "",
    bill_address1: "", bill_address2: "", bill_city: "", bill_state: "TX", bill_zip: "",
  });

  useEffect(() => {
    let abort = false;
    async function run() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/clients/${id}`);
        const j = await res.json();
        if (!res.ok || !j?.ok) throw new Error(j?.error || "Load failed");
        if (abort) return;
        const c: Client = j.client;
        setForm({
          ...c,
          emailsText: (c.emails || []).join(", "),
          ...(c.bill_address1 || c.bill_address2 || c.bill_city || c.bill_state || c.bill_zip
            ? {} : { bill_state: "TX" }),
        } as any);
        setBillingEnabled(!!(c.bill_address1 || c.bill_address2 || c.bill_city || c.bill_state || c.bill_zip));
      } catch (e:any) {
        if (!abort) setErr(e?.message || "Load failed");
      } finally {
        if (!abort) setLoading(false);
      }
    }
    if (id) run();
    return () => { abort = true; };
  }, [id]);

  async function saveAll() {
    setSaving(true); setErr(null);
    try {
      const payload = {
        companyName: form.companyName ?? "",
        address1: form.address1, address2: form.address2, city: form.city, state: form.state, zip: form.zip,
        workPhone1: form.workPhone1, workPhone2: form.workPhone2, cell: form.cell, fax: form.fax,
        emails: form.emailsText,
        preferredContact: form.preferredContact,
        primaryConsultant: form.primaryConsultant,
        alert: form.alert,
        notes: form.notes,
        ...(billingEnabled ? {
          bill_address1: form.bill_address1, bill_address2: form.bill_address2,
          bill_city: form.bill_city, bill_state: form.bill_state, bill_zip: form.bill_zip,
        } : {
          bill_address1: null, bill_address2: null, bill_city: null, bill_state: null, bill_zip: null,
        }),
      };
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT", headers: { "Content-Type":"application/json" }, body: JSON.stringify(payload)
      });
      const j = await res.json();
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Save failed");
      router.refresh();
    } catch (e:any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const headerActions = useMemo(() => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => saveAll()}
        className="rounded bg-[#172554] px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50"
        disabled={saving}
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  ), [saving, form]);

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-6">Loading…</div>;
  if (err) return <div className="mx-auto max-w-6xl px-4 py-6 text-red-600 text-sm">{err}</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <h2 className="text-[13px] font-semibold text-emerald-700 mb-2">FULL CLIENT INFO PAGE (marker)</h2>

      <Panel title="Client Demographics" actions={headerActions}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Labeled label="Company Name">
            <Input value={form.companyName ?? ""} onChange={e=>setForm({...form, companyName: e.target.value})} />
          </Labeled>
          <Labeled label="Primary Consultant">
            <Input value={form.primaryConsultant ?? ""} onChange={e=>setForm({...form, primaryConsultant: e.target.value})} />
          </Labeled>
          <Labeled label="Preferred Contact">
            <select
              className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-[13px] outline-none focus:border-slate-400"
              value={form.preferredContact ?? "WORK1"}
              onChange={(e)=>setForm({...form, preferredContact: e.target.value as any})}
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
            <Input value={form.address1 ?? ""} onChange={e=>setForm({...form, address1: e.target.value})} />
          </Labeled>
          <Labeled label="Address 2">
            <Input value={form.address2 ?? ""} onChange={e=>setForm({...form, address2: e.target.value})} />
          </Labeled>
          <div />

          <Labeled label="City">
            <Input value={form.city ?? ""} onChange={e=>setForm({...form, city: e.target.value})} />
          </Labeled>
          <Labeled label="State">
            <select
              className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-[13px] outline-none focus:border-slate-400"
              value={form.state ?? ""}
              onChange={(e)=>setForm({...form, state: e.target.value})}
            >
              {"AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY"
                .split(" ").map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </Labeled>
          <Labeled label="ZIP">
            <Input value={form.zip ?? ""} onChange={e=>setForm({...form, zip: e.target.value})} />
          </Labeled>

          <Labeled label="Work # 1"><Input value={form.workPhone1 ?? ""} onChange={e=>setForm({...form, workPhone1: e.target.value})} /></Labeled>
          <Labeled label="Work # 2"><Input value={form.workPhone2 ?? ""} onChange={e=>setForm({...form, workPhone2: e.target.value})} /></Labeled>
          <Labeled label="Cell"><Input value={form.cell ?? ""} onChange={e=>setForm({...form, cell: e.target.value})} /></Labeled>

          <Labeled label="Fax"><Input value={form.fax ?? ""} onChange={e=>setForm({...form, fax: e.target.value})} /></Labeled>
          <Labeled label="Emails (comma/space/semicolon separated)">
            <Input
              placeholder="billing@example.com sales@example.com"
              value={form.emailsText}
              onChange={(e)=>setForm({...form, emailsText: e.target.value})}
            />
          </Labeled>
          <div />
        </div>
      </Panel>

      <Panel
        title="Billing Address"
        actions={
          <label className="text-[12px] flex items-center gap-2">
            <input type="checkbox" checked={billingEnabled} onChange={e=>setBillingEnabled(e.target.checked)} />
            Use a separate billing address
          </label>
        }
      >
        {billingEnabled ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Labeled label="Billing Address 1"><Input value={form.bill_address1 ?? ""} onChange={e=>setForm({...form, bill_address1: e.target.value})} /></Labeled>
            <Labeled label="Billing Address 2"><Input value={form.bill_address2 ?? ""} onChange={e=>setForm({...form, bill_address2: e.target.value})} /></Labeled>
            <div />
            <Labeled label="City"><Input value={form.bill_city ?? ""} onChange={e=>setForm({...form, bill_city: e.target.value})} /></Labeled>
            <Labeled label="State">
              <select
                className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-[13px] outline-none focus:border-slate-400"
                value={form.bill_state ?? ""}
                onChange={(e)=>setForm({...form, bill_state: e.target.value})}
              >
                {"AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY"
                  .split(" ").map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
            </Labeled>
            <Labeled label="ZIP"><Input value={form.bill_zip ?? ""} onChange={e=>setForm({...form, bill_zip: e.target.value})} /></Labeled>
          </div>
        ) : (
          <div className="text-[12px] text-slate-600">Billing will use the mailing address above.</div>
        )}
      </Panel>

      <Panel title="Alerts">
        <Textarea value={form.alert ?? ""} onChange={e=>setForm({...form, alert: e.target.value})} />
      </Panel>
    </div>
  );
}
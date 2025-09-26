"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const LEAD_STATUS = [
  "NEW","CONTACTED","ENGAGED","WORKING","NURTURE","QUALIFIED","DISQUALIFIED"
] as const;

function Input(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={"h-9 w-full rounded border border-slate-300 bg-white px-2 text-[13px] outline-none focus:border-slate-400 " + (p.className||"")} />;
}
function TextArea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={"min-h-[72px] w-full rounded border border-slate-300 bg-white px-2 py-1 text-[13px] outline-none focus:border-slate-400 " + (p.className||"")} />;
}

export default function Page(){
  const { id } = useParams<{id:string}>();
  const [items,setItems] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState<string|null>(null);
  const [form,setForm] = useState<any>({ status:"NEW" });

  async function load(){
    try{
      setLoading(true); setErr(null);
      const r = await fetch(`/api/clients/${id}/leads`);
      const j = await r.json(); if(!r.ok||!j.ok) throw new Error(j?.error||"Load failed");
      setItems(j.items||[]);
    }catch(e:any){ setErr(e?.message||"Load failed"); } finally{ setLoading(false); }
  }
  useEffect(()=>{ if(id) load(); },[id]);

  async function add(){
    try{
      const r = await fetch(`/api/clients/${id}/leads`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(form),
      });
      const j = await r.json(); if(!r.ok||!j.ok) throw new Error(j?.error||"Create failed");
      setForm({ status:"NEW" }); load();
    }catch(e:any){ alert(e?.message||"Create failed"); }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="rounded-md border border-slate-300 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-300 bg-slate-100 px-3 py-2">
          <div className="text-[13px] font-semibold tracking-tight text-slate-800">Leads</div>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
            <Input placeholder="Lead Name" value={form.name??""} onChange={e=>setForm({...form,name:e.target.value})}/>
            <Input placeholder="Company" value={form.company??""} onChange={e=>setForm({...form,company:e.target.value})}/>
            <Input placeholder="Email" value={form.email??""} onChange={e=>setForm({...form,email:e.target.value})}/>
            <Input placeholder="Phone" value={form.phone??""} onChange={e=>setForm({...form,phone:e.target.value})}/>
            <Input placeholder="Source" value={form.source??""} onChange={e=>setForm({...form,source:e.target.value})}/>
            <select className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-[13px] outline-none" value={form.status??"NEW"} onChange={e=>setForm({...form,status:e.target.value})}>
              {LEAD_STATUS.map(s=> <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
            </select>
            <Input type="number" placeholder="Score (0–100)" value={form.score??""} onChange={e=>setForm({...form,score:Number(e.target.value||0)})} className="md:col-span-2"/>
            <TextArea placeholder="Interest/Needs" value={form.needs??""} onChange={e=>setForm({...form,needs:e.target.value})} className="md:col-span-2"/>
            <TextArea placeholder="Budget & timeframe" value={form.budgetTimeframe??""} onChange={e=>setForm({...form,budgetTimeframe:e.target.value})} className="md:col-span-2"/>
            <button onClick={add} className="h-9 rounded bg-[#172554] px-3 text-[13px] font-semibold text-white md:col-span-6">Add</button>
          </div>

          {loading ? <div>Loading…</div> : err ? <div className="text-red-600 text-sm">{err}</div> : (
            <div className="overflow-auto">
              <table className="w-full text-[13px]">
                <thead><tr className="text-left border-b">
                  <th className="py-2 pr-3">Lead</th>
                  <th className="py-2 pr-3">Company</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Score</th>
                  <th className="py-2 pr-3">Needs</th>
                  <th className="py-2 pr-3">Budget & timeframe</th>
                </tr></thead>
                <tbody>
                  {items.map((it:any)=>(
                    <tr key={it.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">{it.name}</td>
                      <td className="py-2 pr-3">{it.company??""}</td>
                      <td className="py-2 pr-3">{it.status}</td>
                      <td className="py-2 pr-3">{typeof it.score==='number'? it.score : ""}</td>
                      <td className="py-2 pr-3">{it.needs??""}</td>
                      <td className="py-2 pr-3">{it.budgetTimeframe??""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
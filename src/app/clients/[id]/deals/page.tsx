"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const DEAL_STAGES = [
  "NEW","ANALYSIS_DISCOVERY","PROPOSAL_SENT","QUALIFIED","REVIEW","NEGOTIATION","CLOSED_WON","CLOSED_LOST"
] as const;

const LOSS_REASONS = [
  "", // blank default
  "PRICING",
  "COMPETITION",
  "BUDGET",
  "NO_DECISION_TIMING",
  "POOR_FIT_MISSING_FEATURES",
  "SALES_PROCESS",
  "RELATIONSHIP",
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
  const [form,setForm] = useState<any>({ stage:"NEW", probability:0 });

  async function load(){
    try{
      setLoading(true); setErr(null);
      const r = await fetch(`/api/clients/${id}/deals`);
      const j = await r.json(); if(!r.ok||!j.ok) throw new Error(j?.error||"Load failed");
      setItems(j.items||[]);
    }catch(e:any){ setErr(e?.message||"Load failed"); } finally{ setLoading(false); }
  }
  useEffect(()=>{ if(id) load(); },[id]);

  async function add(){
    try{
      const r = await fetch(`/api/clients/${id}/deals`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(form),
      });
      const j = await r.json(); if(!r.ok||!j.ok) throw new Error(j?.error||"Create failed");
      setForm({ stage:"NEW", probability:0 }); load();
    }catch(e:any){ alert(e?.message||"Create failed"); }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="rounded-md border border-slate-300 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-300 bg-slate-100 px-3 py-2">
          <div className="text-[13px] font-semibold tracking-tight text-slate-800">Deals</div>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            <Input placeholder="Deal Title" value={form.title??""} onChange={e=>setForm({...form,title:e.target.value})}/>
            <Input type="number" step="0.01" placeholder="Deal Value (USD)" value={form.value??""} onChange={e=>setForm({...form,value: e.target.value})}/>
            <select className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-[13px] outline-none" value={form.stage??"NEW"} onChange={e=>setForm({...form,stage:e.target.value})}>
              {DEAL_STAGES.map(s=> <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
            </select>
            <select className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-[13px] outline-none" value={form.probability??0} onChange={e=>setForm({...form,probability:Number(e.target.value)})}>
              {[0,25,50,75,100].map(n=> <option key={n} value={n}>{n}%</option>)}
            </select>
            <Input placeholder="Decision-Makers (comma/space/semicolon separated)" value={form.decisionMakers??""} onChange={e=>setForm({...form,decisionMakers:e.target.value})} className="md:col-span-2"/>
            <Input type="date" placeholder="Close date" value={form.closedAt??""} onChange={e=>setForm({...form,closedAt:e.target.value})}/>
            <select className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-[13px] outline-none" value={form.lossReason??""} onChange={e=>setForm({...form,lossReason:e.target.value})}>
              {LOSS_REASONS.map(s=> <option key={s} value={s}>{s? s.replace(/_/g," ") : "(no loss reason)"}</option>)}
            </select>
            <TextArea placeholder="Loss notes (optional)" value={form.lossNotes??""} onChange={e=>setForm({...form,lossNotes:e.target.value})} className="md:col-span-6"/>
            <button onClick={add} className="h-9 rounded bg-[#172554] px-3 text-[13px] font-semibold text-white md:col-span-7">Add</button>
          </div>

          {loading ? <div>Loading…</div> : err ? <div className="text-red-600 text-sm">{err}</div> : (
            <div className="overflow-auto">
              <table className="w-full text-[13px]">
                <thead><tr className="text-left border-b">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Stage</th>
                  <th className="py-2 pr-3">Prob %</th>
                  <th className="py-2 pr-3">Value</th>
                  <th className="py-2 pr-3">Decision-Makers</th>
                  <th className="py-2 pr-3">Loss reason</th>
                </tr></thead>
                <tbody>
                  {items.map((it:any)=>(
                    <tr key={it.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">{it.title}</td>
                      <td className="py-2 pr-3">{it.stage}</td>
                      <td className="py-2 pr-3">{it.probability ?? 0}</td>
                      <td className="py-2 pr-3">{typeof it.value==='number' ? ((it.value||0)/100).toLocaleString(undefined,{style:'currency',currency:'USD'}) : ""}</td>
                      <td className="py-2 pr-3">{Array.isArray(it.decisionMakers) ? it.decisionMakers.join(", ") : ""}</td>
                      <td className="py-2 pr-3">{it.lossReason ?? ""}</td>
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
"use client";

import { useEffect, useRef, useState } from "react";

type Status = "Unconfirmed"|"Confirmed"|"Signed-In"|"Signed-Out"|"Cancelled"|"Missed"|"Left Message"|"Year-Out";

export default function MakeAppointmentModal({
  open,
  onClose,
  initial,
  consultants,
}: {
  open: boolean;
  onClose: () => void;
  initial: { consultantId?: string; consultantName?: string; startISO?: string; durationMin?: number; };
  consultants: { id: string; name: string }[];
}) {
  const dialogRef = useRef<HTMLDialogElement|null>(null);

  const [consultantId, setConsultantId] = useState(initial.consultantId || "");
  const [clientName, setClientName] = useState("");
  const [durationMin, setDurationMin] = useState(initial.durationMin ?? 30);
  const [startISO, setStartISO] = useState(initial.startISO || "");
  const [contactInfo, setContactInfo] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("Unconfirmed");
  const [flag, setFlag] = useState<string>("None");

  useEffect(()=>{ const d=dialogRef.current; if(!d) return; if(open && !d.open) d.showModal(); if(!open && d.open) d.close(); },[open]);

  const onSave = () => {
    alert([
      "Appointment saved (mock).",
      `Consultant: ${consultants.find(c=>c.id===consultantId)?.name||""}`,
      `Start: ${startISO}`,
      `Duration: ${durationMin} min`,
      `Client: ${clientName}`,
      `Contact Info: ${contactInfo}`,
      `Notes: ${notes}`,
      `Status: ${status}`,
      `Flag: ${flag}`,
    ].join("\n"));
    onClose();
  };

  return (
    <dialog ref={dialogRef} className="rounded-lg p-0">
      <form method="dialog" className="min-w-[640px] max-w-[760px] rounded-lg border bg-white p-4" onSubmit={(e)=>e.preventDefault()}>
        <div className="mb-3 text-lg font-semibold">Make Appointment</div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="grid gap-1">
            <span className="text-gray-600">Consultant</span>
            <select value={consultantId} onChange={(e)=>setConsultantId(e.target.value)} className="rounded border px-2 py-1">
              <option value=""> select consultant </option>
              {consultants.map(c=> (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-gray-600">Start</span>
            <input type="datetime-local" value={startISO ? startISO.slice(0,16) : ""} onChange={(e)=>setStartISO(new Date(e.target.value).toISOString())} className="rounded border px-2 py-1" />
          </label>

          <label className="grid gap-1">
            <span className="text-gray-600">Duration (min)</span>
            <input type="number" step={5} min={5} value={durationMin} onChange={(e)=>setDurationMin(parseInt(e.target.value||"0",10))} className="rounded border px-2 py-1" />
          </label>

          <label className="grid gap-1">
            <span className="text-gray-600">Client (Office)</span>
            <div className="flex gap-2">
              <input value={clientName} onChange={(e)=>setClientName(e.target.value)} className="min-w-0 grow rounded border px-2 py-1" placeholder="Search or type office/client name" />
              <button type="button" className="rounded border px-2 py-1 hover:bg-gray-50" title="Add New Client" onClick={()=>alert("TODO: Add New Client modal")}>+</button>
              <button type="button" className="rounded border px-2 py-1 hover:bg-gray-50" title="Search Client" onClick={()=>alert("TODO: Search Client dialog")}></button>
            </div>
          </label>

          <label className="col-span-2 grid gap-1">
            <span className="text-gray-600">Contact Info</span>
            <textarea rows={2} value={contactInfo} onChange={(e)=>setContactInfo(e.target.value)} className="rounded border px-2 py-1" placeholder="Office name  primary phone  primary email" />
          </label>

          <label className="col-span-2 grid gap-1">
            <span className="text-gray-600">Notes</span>
            <textarea rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} className="rounded border px-2 py-1" placeholder="Notes to copy into Client Info > Notes" />
          </label>

          <label className="grid gap-1">
            <span className="text-gray-600">Status</span>
            <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="rounded border px-2 py-1">
              {["Unconfirmed","Confirmed","Signed-In","Signed-Out","Cancelled","Missed","Left Message","Year-Out"].map(s=> (<option key={s}>{s}</option>))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-gray-600">Flag</span>
            <select value={flag} onChange={(e)=>setFlag(e.target.value)} className="rounded border px-2 py-1">
              {["None","Urgent","VIP","New","Follow-up"].map(f=> (<option key={f}>{f}</option>))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50" onClick={onClose}>Cancel</button>
          <button type="button" className="rounded bg-black px-3 py-1.5 text-sm text-white hover:opacity-90" onClick={onSave}>Save Appointment</button>
        </div>
      </form>
    </dialog>
  );
}

"use client";
import { useState } from "react";

export default function NotesModal({
  initial,
  onClose,
  onSave,
}: {
  initial: string;
  onClose: () => void;
  onSave: (val: string) => void;
}) {
  const [val, setVal] = useState(initial ?? "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-md border border-slate-300 bg-white shadow-lg">
        <div className="border-b border-slate-200 px-4 py-2 text-sm font-semibold">Edit Notes</div>
        <div className="p-4">
          <textarea
            className="min-h-[220px] w-full rounded border border-slate-300 p-2 text-[13px] outline-none focus:border-slate-400"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Enter client notes…"
          />
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-2">
          <button onClick={onClose} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-[13px] hover:bg-slate-50">Cancel</button>
          <button
            onClick={() => onSave(val)}
            className="rounded bg-[#172554] px-3 py-1.5 text-[13px] font-semibold text-white"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}
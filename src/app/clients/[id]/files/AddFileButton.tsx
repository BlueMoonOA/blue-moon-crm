"use client";

import { useRef } from "react";

type Props = {
  clientId: string;
  className?: string;
};

/**
 * Neutral, compact button that opens a file picker
 * and (optionally) uploads to your API.
 */
export default function AddFileButton({ clientId, className = "" }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => inputRef.current?.click();

  const onChoose = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Wire this to your upload route.
    // If you already have an endpoint (e.g. /api/clients/[id]/files),
    // this will send the file there.
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("clientId", clientId);

      // Change to YOUR actual upload route if different
      const res = await fetch(`/api/clients/${clientId}/files`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const msg = await res.text();
        alert(`Upload failed: ${res.status} ${msg}`);
        return;
      }

      alert("File uploaded (server responded OK). Refresh to see it listed.");
      // Optionally trigger a refresh with router.refresh()
      // or lift state to re-fetch the files table.
    } catch (err: any) {
      console.error(err);
      alert("Upload error (see console).");
    } finally {
      // reset the input so selecting the same file again fires change
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <button type="button" className={className} onClick={openPicker}>
        Add File
      </button>
      <input
        ref={inputRef}
        type="file"
        // accept="application/pdf,image/*" // <-- add if you want to restrict types
        className="hidden"
        onChange={onChoose}
      />
    </>
  );
}

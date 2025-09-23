// src/components/Modal.tsx
"use client";

import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  submitText?: string;
  destructive?: boolean;
  children: React.ReactNode;
};

/**
 * Small, dependency-free modal.
 * - Closes on ESC or backdrop click
 * - Focus trap is intentionally minimal (keeps things simple)
 */
export default function Modal({
  open,
  title,
  onClose,
  onSubmit,
  submitText = "Save",
  destructive = false,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Card */}
      <div className="relative z-10 w-[92vw] max-w-lg rounded-lg bg-white shadow-xl">
        <div className="border-b px-4 py-3">
          <div className="text-base font-semibold">{title}</div>
        </div>

        <div className="px-4 py-3">{children}</div>

        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          <button
            onClick={onClose}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          {onSubmit && (
            <button
              onClick={onSubmit}
              className={`rounded px-3 py-1.5 text-sm text-white ${
                destructive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-black hover:opacity-90"
              }`}
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

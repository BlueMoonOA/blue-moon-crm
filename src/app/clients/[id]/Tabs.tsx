// src/app/clients/[id]/Tabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TabKey = "quick" | "info" | "leads" | "deals" | "proposals" | "files";

export default function Tabs({
  id,
  active,
}: {
  id: string;
  active?: TabKey;
}) {
  const pathname = usePathname() ?? "";
  const base = `/clients/${id}`;

  const items: { key: TabKey; href: string; label: string }[] = [
    { key: "quick", href: `${base}`,         label: "Quick View" },
    { key: "info",  href: `${base}/info`,    label: "Client Info" },
    { key: "leads", href: `${base}/leads`,   label: "Leads" },
    { key: "deals", href: `${base}/deals`,   label: "Deals" },
    { key: "proposals", href: `${base}/proposals`, label: "Proposals" },
    { key: "files", href: `${base}/files`,   label: "Files" },
  ];

  const isActive = (href: string, key: TabKey) =>
    active ? active === key : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="mb-4 flex gap-2">
      {items.map((it) => {
        const on = isActive(it.href, it.key);
        return (
          <Link
            key={it.key}
            href={it.href}
            className={`rounded border px-3 py-1.5 text-sm ${
              on ? "bg-black text-white" : "hover:bg-gray-50"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}


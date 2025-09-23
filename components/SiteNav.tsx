"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function Item({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname() || "/";
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  const base = "inline-block px-3 py-2 border rounded mr-2";
  const selected = "bg-black text-white";
  return (
    <Link href={href} className={`${base} ${active ? selected : ""}`}>
      {children}
    </Link>
  );
}

export default function SiteNav() {
  return (
    <header className="border-b">
      <nav className="max-w-screen-xl mx-auto p-3">
        <Item href="/">Home</Item>
        <Item href="/clients">Clients</Item>
        <Item href="/schedule">Schedule</Item>
      </nav>
    </header>
  );
}
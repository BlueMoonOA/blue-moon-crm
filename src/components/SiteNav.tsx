// src/components/SiteNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function SiteNav() {
  const pathname = usePathname();

  const items = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/clients", label: "Clients" },
      { href: "/schedule", label: "Schedule" },
    ],
    []
  );

  return (
    <nav className="site-nav">
      <div className="site-nav__inner">
        {items.map((it) => {
          const active =
            it.href === "/"
              ? pathname === "/"
              : pathname === it.href || pathname?.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`nav-btn ${active ? "is-active" : ""}`}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

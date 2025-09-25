"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const tabs = [
  { href: "/", label: "Home" },
  { href: "/clients", label: "Clients" },
  { href: "/schedule", label: "Schedule" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav">
      <div className="site-nav__inner">
        {tabs.map((t) => {
          const active =
            t.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`btn${active ? " btn--active" : ""}`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

function NavBtn({ href, label }: { href: string; label: string }) {
  const pathname = usePathname() || "/";
  const isHome = href === "/home" && (pathname === "/" || pathname.startsWith("/home"));
  const isActive = isHome || (href !== "/home" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium",
        "transition-colors",
        isActive
          ? "bg-[#172554] border-[#172554] text-white"
          : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
      )}
    >
      {label}
    </Link>
  );
}

export default function AppNav() {
  return (
    <nav className="w-full flex justify-center gap-3 py-3">
      <NavBtn href="/home" label="Home" />
      <NavBtn href="/clients" label="Clients" />
      <NavBtn href="/schedule" label="Schedule" />
    </nav>
  );
}

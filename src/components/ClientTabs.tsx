"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function ClientTabs({ clientId }: { clientId: string }) {
  const pathname = usePathname() || "";

  const mk = (seg: string) => `/clients/${clientId}${seg}`;
  const is = (seg: string) =>
    pathname === mk(seg) || pathname.startsWith(mk(seg) + "/");

  const Btn = ({href, label, active}:{href:string; label:string; active:boolean}) => (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-[#172554] border-[#172554] text-white"
          : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex gap-2">
      <Btn href={mk("/overview")}   label="Quick View" active={is("/overview")} />
      <Btn href={mk("/info")}       label="Client Info" active={is("/info")} />
      <Btn href={mk("/leads")}      label="Leads"       active={is("/leads")} />
      <Btn href={mk("/deals")}      label="Deals"       active={is("/deals")} />
      <Btn href={mk("/proposals")}  label="Proposals"   active={is("/proposals")} />
      <Btn href={mk("/files")}      label="Files"       active={is("/files")} />
    </div>
  );
}
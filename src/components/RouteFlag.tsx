"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Sets body[data-route] to "home" | "clients" | "schedule" */
export default function RouteFlag() {
  const pathname = usePathname();
  useEffect(() => {
    const b = document.body;
    if (!b) return;
    if (pathname === "/" || pathname.startsWith("/home")) b.dataset.route = "home";
    else if (pathname.startsWith("/clients")) b.dataset.route = "clients";
    else if (pathname.startsWith("/schedule")) b.dataset.route = "schedule";
    else delete b.dataset.route;
  }, [pathname]);
  return null;
}

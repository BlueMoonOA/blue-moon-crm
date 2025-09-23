"use client";

import { SessionProvider } from "next-auth/react";
import type React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // If you need to pass a session from server, you can add `session={session}` here later
  return <SessionProvider>{children}</SessionProvider>;
}

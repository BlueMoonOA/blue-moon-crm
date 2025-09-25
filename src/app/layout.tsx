export const metadata = { title: "Blue Moon CRM" };

import "./globals.css";
import React from "react";
import AppNav from "@/components/AppNav";
import AuthSession from "@/components/AuthSession";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-slate-900">
        <AuthSession>
          <AppNav />
          {children}
        </AuthSession>
      </body>
    </html>
  );
}

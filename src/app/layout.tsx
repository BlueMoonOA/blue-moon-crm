import "./globals.css";
import "./ui.css";
import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Blue Moon CRM",
  description: "Internal CRM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteNav />
          <main className="page-container">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
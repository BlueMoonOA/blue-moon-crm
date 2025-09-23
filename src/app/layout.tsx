import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Blue Moon CRM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}



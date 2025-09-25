import React from "react";
import ClientTabs from "@/components/ClientTabs";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <ClientTabs clientId={id} />
      {children}
    </div>
  );
}
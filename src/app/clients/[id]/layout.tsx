// src/app/clients/[id]/layout.tsx
import ClientTabs from "./Tabs";

export const dynamic = "force-dynamic";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <section className="mx-auto max-w-6xl p-6">
      {/* Single, canonical place for the client tabs */}
      <ClientTabs id={id} />
      {children}
    </section>
  );
}






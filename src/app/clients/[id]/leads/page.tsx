// src/app/clients/[id]/leads/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const clientSelect = { id: true } as const;
type Client = Prisma.ClientGetPayload<{ select: typeof clientSelect }>;

const leadSelect = {
  id: true,
  name: true,
  company: true,
  email: true,
  phone: true,
  status: true,
  createdAt: true,
} as const;
type LeadRow = Prisma.LeadGetPayload<{ select: typeof leadSelect }>;

export default async function ClientLeadsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = (await prisma.client.findUnique({
    where: { id },
    select: clientSelect,
  })) as Client | null;

  if (!client) notFound();

  const leads = (await prisma.lead.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    select: leadSelect,
  })) as LeadRow[];

  return (
    <main>
      <h1 className="text-2xl font-semibold tracking-tight mb-4">Leads</h1>

      <div className="rounded border overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b text-left text-gray-600">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Company</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-gray-500" colSpan={6}>No leads.</td>
              </tr>
            )}
            {leads.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-3 py-2">{l.name}</td>
                <td className="px-3 py-2">{l.company ?? "—"}</td>
                <td className="px-3 py-2">{l.email ?? "—"}</td>
                <td className="px-3 py-2">{l.phone ?? "—"}</td>
                <td className="px-3 py-2">{l.status}</td>
                <td className="px-3 py-2">{new Date(l.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}


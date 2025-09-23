// src/app/clients/[id]/proposals/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const clientSelect = { id: true } as const;
type Client = Prisma.ClientGetPayload<{ select: typeof clientSelect }>;

const proposalSelect = {
  id: true,
  title: true,
  status: true,
  issueDate: true,
  validUntil: true,
  deal: { select: { title: true } },
} as const;
type ProposalRow = Prisma.ProposalGetPayload<{ select: typeof proposalSelect }>;

export default async function ClientProposalsPage({
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

  // proposals linked to deals that belong to this client
  const proposals = (await prisma.proposal.findMany({
    where: { deal: { clientId: client.id } },
    orderBy: { issueDate: "desc" },
    select: proposalSelect,
  })) as ProposalRow[];

  return (
    <main>
      <h1 className="text-2xl font-semibold tracking-tight mb-4">Proposals</h1>

      <div className="rounded border overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b text-left text-gray-600">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Deal</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Issued</th>
              <th className="px-3 py-2">Valid Until</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-gray-500" colSpan={5}>No proposals.</td>
              </tr>
            )}
            {proposals.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2">{p.title}</td>
                <td className="px-3 py-2">{p.deal?.title ?? "—"}</td>
                <td className="px-3 py-2">{p.status}</td>
                <td className="px-3 py-2">{new Date(p.issueDate).toLocaleDateString()}</td>
                <td className="px-3 py-2">{new Date(p.validUntil).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}


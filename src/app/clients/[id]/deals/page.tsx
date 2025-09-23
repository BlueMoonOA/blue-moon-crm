// src/app/clients/[id]/deals/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const clientSelect = { id: true } as const;
type Client = Prisma.ClientGetPayload<{ select: typeof clientSelect }>;

const dealSelect = {
  id: true,
  title: true,
  value: true,
  stage: true,
  updatedAt: true,
} as const;
type DealRow = Prisma.DealGetPayload<{ select: typeof dealSelect }>;

function money(cents?: number | null) {
  const n = typeof cents === "number" ? cents : 0;
  return (n / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default async function ClientDealsPage({
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

  const deals = (await prisma.deal.findMany({
    where: { clientId: client.id },
    orderBy: { updatedAt: "desc" },
    select: dealSelect,
  })) as DealRow[];

  return (
    <main>
      <h1 className="text-2xl font-semibold tracking-tight mb-4">Deals</h1>

      <div className="rounded border overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b text-left text-gray-600">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Stage</th>
              <th className="px-3 py-2">Value</th>
              <th className="px-3 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-gray-500" colSpan={4}>No deals.</td>
              </tr>
            )}
            {deals.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="px-3 py-2">{d.title}</td>
                <td className="px-3 py-2">{d.stage}</td>
                <td className="px-3 py-2">{money(d.value)}</td>
                <td className="px-3 py-2">{new Date(d.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}


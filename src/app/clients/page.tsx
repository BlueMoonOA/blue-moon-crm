// src/app/clients/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma"; // if your alias isn't set, use: "../../../lib/prisma"

export const dynamic = "force-dynamic";

// keep types simple and local to avoid Prisma type import issues
type ClientRow = {
  id: string;
  name: string | null;
  city: string | null;
  state: string | null;
  workPhone1: string | null;
};

export default async function ClientsPage({
  searchParams,
}: {
  // In Next 15, searchParams is a Promise
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const clients: ClientRow[] = await prisma.client.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { state: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ name: "asc" }],
    take: 100,
    select: {
      id: true,
      name: true,
      city: true,
      state: true,
      workPhone1: true,
    },
  });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <form action="/clients" className="flex items-center gap-2">
          <input
            name="q"
            placeholder="Search name or city…"
            defaultValue={query}
            className="h-9 rounded-md border px-3 text-sm"
          />
          <button className="h-9 rounded-md border px-3 text-sm hover:bg-gray-50">
            Search
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-3 py-2">Client / Office</th>
              <th className="px-3 py-2">City</th>
              <th className="px-3 py-2">State</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {clients.map((c: ClientRow) => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2">{c.name ?? "—"}</td>
                <td className="px-3 py-2">{c.city ?? "—"}</td>
                <td className="px-3 py-2">{c.state ?? "—"}</td>
                <td className="px-3 py-2">{c.workPhone1 ?? "—"}</td>
                <td className="px-3 py-2 text-right">
                  <Link
                    className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                    href={`/clients/${c.id}`}
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td className="px-3 py-8 text-center text-gray-500" colSpan={5}>
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}




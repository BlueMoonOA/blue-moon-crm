// src/app/clients/[id]/info/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/* helpers */
function fmtPhone(v?: string | null) {
  if (!v) return "—";
  const d = v.replace(/\D+/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return v;
}

/* select */
const clientSelect = {
  id: true,
  accountNumber: true,
  name: true,
  address1: true,
  address2: true,
  city: true,
  state: true,
  zip: true,
  workPhone1: true,
  workPhone2: true,
  fax: true,
  otherPhone: true,
  emails: true,
  notes: true,
} as const;

type Base = Prisma.ClientGetPayload<{ select: typeof clientSelect }>;
type ClientRow = Omit<Base, "notes"> & { notes: string | null };

export default async function ClientInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = (await prisma.client.findUnique({
    where: { id },
    select: clientSelect,
  })) as ClientRow | null;

  if (!client) notFound();

  const emails: string[] = Array.isArray(client.emails) ? client.emails : [];
  const notesText = typeof client.notes === "string" ? client.notes.trim() : "";

  return (
    <main>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {client.name} — Info
        </h1>

        <Link
          href={`/clients/${client.id}/edit`}
          className="rounded bg-black text-white px-3 py-1.5 text-sm hover:opacity-90"
        >
          Edit Client Info
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Office */}
        <div className="rounded border p-4">
          <div className="text-sm text-gray-500 mb-3">Office Details</div>
          <dl className="grid grid-cols-[10rem_1fr] gap-y-2 text-sm">
            <dt className="text-gray-500">Account #</dt>
            <dd>{client.accountNumber ?? "—"}</dd>
            <dt className="text-gray-500">Address 1</dt>
            <dd>{client.address1 ?? "—"}</dd>
            <dt className="text-gray-500">Address 2</dt>
            <dd>{client.address2 ?? "—"}</dd>
            <dt className="text-gray-500">City</dt>
            <dd>{client.city ?? "—"}</dd>
            <dt className="text-gray-500">State</dt>
            <dd>{client.state ?? "—"}</dd>
            <dt className="text-gray-500">ZIP</dt>
            <dd>{client.zip ?? "—"}</dd>
          </dl>
        </div>

        {/* Phones + Emails */}
        <div className="rounded border p-4">
          <div className="text-sm text-gray-500 mb-3">Phones</div>
          <dl className="grid grid-cols-[10rem_1fr] gap-y-2 text-sm">
            <dt className="text-gray-500">Work #1</dt>
            <dd>{fmtPhone(client.workPhone1)}</dd>
            <dt className="text-gray-500">Work #2</dt>
            <dd>{fmtPhone(client.workPhone2)}</dd>
            <dt className="text-gray-500">Fax</dt>
            <dd>{fmtPhone(client.fax)}</dd>
            <dt className="text-gray-500">Other</dt>
            <dd>{fmtPhone(client.otherPhone)}</dd>
          </dl>

          <div className="mt-4 text-sm">
            <div className="text-gray-500 mb-1">Emails</div>
            {emails.length === 0 ? (
              <div>—</div>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {emails.map((e, i) => (
                  <li key={`${e}-${i}`}>
                    <a className="text-blue-600 hover:underline" href={`mailto:${e}`}>
                      {e}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="mt-6">
        <div className="rounded border p-4">
          <div className="text-sm text-gray-500 mb-2">Notes</div>
          <div className="text-sm whitespace-pre-wrap">
            {notesText || "—"}
          </div>
        </div>
      </section>
    </main>
  );
}








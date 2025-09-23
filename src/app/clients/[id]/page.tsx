// src/app/clients/[id]/page.tsx
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
function fmtDate(dt: Date) {
  return new Date(dt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function fmtTime(dt: Date) {
  return new Date(dt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function money(cents?: number | null) {
  const n = typeof cents === "number" ? cents : 0;
  return (n / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/* typed selects */
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
  alert: true,
  balanceCents: true,
} as const;

type ClientRow = Prisma.ClientGetPayload<{ select: typeof clientSelect }>;

const apptSelect = {
  id: true,
  startAt: true,
  type: true,
  status: true,
  consultant: { select: { name: true } },
} as const;
type ApptRow = Prisma.AppointmentGetPayload<{ select: typeof apptSelect }>;

export default async function ClientQuickView({
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

  const now = new Date();

  const upcoming = (await prisma.appointment.findMany({
    where: { clientId: client.id, startAt: { gte: now } },
    orderBy: { startAt: "asc" },
    take: 10,
    select: apptSelect,
  })) as ApptRow[];

  const previous = (await prisma.appointment.findMany({
    where: { clientId: client.id, startAt: { lt: now } },
    orderBy: { startAt: "desc" },
    take: 10,
    select: apptSelect,
  })) as ApptRow[];

  const firstEmail = (client.emails?.[0] ?? "") as string;

  const addrLines = [
    client.address1,
    client.address2,
    [client.city, client.state, client.zip].filter(Boolean).join(", "),
  ].filter(Boolean);

  return (
    <main>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {client.name ?? "Client"}
        </h1>
      </div>

      {/* Summary boxes */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded border p-4">
          <div className="text-sm text-gray-500 mb-1">Client / Office</div>
          <div className="font-medium">{client.name ?? "—"}</div>
          <div className="mt-2 text-sm space-y-0.5">
            {addrLines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
            {firstEmail && (
              <div className="mt-2">
                <a className="text-blue-600 hover:underline" href={`mailto:${firstEmail}`}>
                  {firstEmail}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="rounded border p-4">
          <div className="text-sm text-gray-500 mb-1">Phone & Fax</div>
          <div className="text-sm space-y-1">
            <div>Work #1: {fmtPhone(client.workPhone1)}</div>
            <div>Work #2: {fmtPhone(client.workPhone2)}</div>
            <div>Fax: {fmtPhone(client.fax)}</div>
            <div>Other #: {fmtPhone(client.otherPhone)}</div>
          </div>
        </div>

        <div className="rounded border p-4">
          <div className="text-sm text-gray-500 mb-1">Account</div>
          <div className="text-sm space-y-1">
            <div>
              Account #: <span className="font-medium">{client.accountNumber ?? "—"}</span>
            </div>
            <div>
              Client Balance: <span className="font-medium">{money(client.balanceCents)}</span>
            </div>
            {client.alert && (
              <div className="mt-3">
                <div className="text-sm text-gray-500 mb-1">Alerts</div>
                <div className="rounded bg-yellow-50 border border-yellow-200 p-2 text-sm">
                  {client.alert}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Appointments */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded border overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 text-sm font-medium">Next Appointments</div>
          <table className="min-w-full text-sm">
            <thead className="border-b text-left text-gray-600">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Appt Type</th>
                <th className="px-3 py-2">Appt Status</th>
                <th className="px-3 py-2">EMP</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.length === 0 && (
                <tr>
                  <td className="px-3 py-3 text-gray-500" colSpan={5}>None</td>
                </tr>
              )}
              {upcoming.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-3 py-2">{fmtDate(a.startAt)}</td>
                  <td className="px-3 py-2">{fmtTime(a.startAt)}</td>
                  <td className="px-3 py-2">{a.type ?? "—"}</td>
                  <td className="px-3 py-2">{a.status ?? "—"}</td>
                  <td className="px-3 py-2">{a.consultant?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded border overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 text-sm font-medium">Previous Appointments</div>
          <table className="min-w-full text-sm">
            <thead className="border-b text-left text-gray-600">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Appt Type</th>
                <th className="px-3 py-2">Appt Status</th>
                <th className="px-3 py-2">EMP</th>
              </tr>
            </thead>
            <tbody>
              {previous.length === 0 && (
                <tr>
                  <td className="px-3 py-3 text-gray-500" colSpan={5}>None</td>
                </tr>
              )}
              {previous.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-3 py-2">{fmtDate(a.startAt)}</td>
                  <td className="px-3 py-2">{fmtTime(a.startAt)}</td>
                  <td className="px-3 py-2">{a.type ?? "—"}</td>
                  <td className="px-3 py-2">{a.status ?? "—"}</td>
                  <td className="px-3 py-2">{a.consultant?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

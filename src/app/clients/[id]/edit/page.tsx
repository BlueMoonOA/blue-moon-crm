// src/app/clients/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/** Convert textarea/comma list into clean array of emails */
function parseEmails(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,;]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** ---------- select typed to your schema ---------- */
const clientSelect = {
  id: true,
  accountNumber: true, // read-only
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

  emails: true, // string[]
  notes: true,  // String? @db.Text
  alert: true,  // String? @db.Text
} as const;

type ClientRow = Prisma.ClientGetPayload<{ select: typeof clientSelect }>;

/** Server action */
async function updateClientAction(id: string, formData: FormData) {
  "use server";

  // Required string (never null) – use for `name`
  const getStr = (k: string) => (formData.get(k) ?? "").toString().trim();

  // Optional string – empty => null
  const getOpt = (k: string) => {
    const v = (formData.get(k) ?? "").toString().trim();
    return v ? v : null;
  };

  const emails = parseEmails((formData.get("emails") ?? "").toString());

  // Use operation form everywhere => TS-friendly on Prisma v6
  const data: Prisma.ClientUpdateInput = {
    name: { set: getStr("name") },

    address1: { set: getOpt("address1") },
    address2: { set: getOpt("address2") },
    city: { set: getOpt("city") },
    state: { set: getOpt("state") },
    zip: { set: getOpt("zip") },

    workPhone1: { set: getOpt("workPhone1") },
    workPhone2: { set: getOpt("workPhone2") },
    fax: { set: getOpt("fax") },
    otherPhone: { set: getOpt("otherPhone") },

    // Postgres string[] prefers `{ set: [...] }`
    emails: { set: emails },

    // Nullable text
    notes: { set: getOpt("notes") },
    alert: { set: getOpt("alert") },
  };

  await prisma.client.update({ where: { id }, data });

  revalidatePath(`/clients/${id}`);
  revalidatePath(`/clients/${id}/info`);
  redirect(`/clients/${id}/info`);
}

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = (await prisma.client.findUnique({
    where: { id },
    select: clientSelect,
  })) as ClientRow | null;

  if (!client) redirect("/clients");

  const emailsText =
    Array.isArray(client.emails) && client.emails.length
      ? client.emails.join("\n")
      : "";

  return (
    <main className="mx-auto max-w-4xl p-6">
      {/* Tabs + actions */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-2">
          <Link
            href={`/clients/${client.id}`}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Quick View
          </Link>
          <Link
            href={`/clients/${client.id}/info`}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Client Info
          </Link>
          <span className="rounded border px-3 py-1.5 text-sm bg-black text-white">
            Edit
          </span>
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight mb-4">
        Edit — {client.name}
      </h1>

      <form action={updateClientAction.bind(null, client.id)} className="space-y-6">
        {/* Account (read-only) + Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Account #</span>
            <input
              className="rounded border px-3 py-2 bg-gray-50"
              defaultValue={client.accountNumber ?? ""}
              readOnly
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Client / Office Name</span>
            <input
              name="name"
              className="rounded border px-3 py-2"
              defaultValue={client.name ?? ""}
              required
            />
          </label>
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Address 1</span>
            <input name="address1" className="rounded border px-3 py-2" defaultValue={client.address1 ?? ""} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Address 2</span>
            <input name="address2" className="rounded border px-3 py-2" defaultValue={client.address2 ?? ""} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">City</span>
            <input name="city" className="rounded border px-3 py-2" defaultValue={client.city ?? ""} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-600">State</span>
              <input name="state" className="rounded border px-3 py-2" defaultValue={client.state ?? ""} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-600">ZIP</span>
              <input name="zip" className="rounded border px-3 py-2" defaultValue={client.zip ?? ""} />
            </label>
          </div>
        </div>

        {/* Phones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Work #1</span>
            <input name="workPhone1" className="rounded border px-3 py-2" defaultValue={client.workPhone1 ?? ""} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Work #2</span>
            <input name="workPhone2" className="rounded border px-3 py-2" defaultValue={client.workPhone2 ?? ""} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Fax</span>
            <input name="fax" className="rounded border px-3 py-2" defaultValue={client.fax ?? ""} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Other</span>
            <input name="otherPhone" className="rounded border px-3 py-2" defaultValue={client.otherPhone ?? ""} />
          </label>
        </div>

        {/* Emails */}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-600">Emails (one per line or comma separated)</span>
          <textarea
            name="emails"
            rows={4}
            className="rounded border px-3 py-2"
            defaultValue={emailsText}
          />
        </label>

        {/* Notes & Alert */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Notes</span>
            <textarea name="notes" rows={6} className="rounded border px-3 py-2" defaultValue={client.notes ?? ""} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Alert (shows on Quick View)</span>
            <textarea name="alert" rows={6} className="rounded border px-3 py-2" defaultValue={client.alert ?? ""} />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/clients/${client.id}/info`} className="rounded border px-3 py-2 text-sm hover:bg-gray-50">
            Cancel
          </Link>
          <button type="submit" className="rounded bg-black text-white px-3 py-2 text-sm hover:opacity-90">
            Save Changes
          </button>
        </div>
      </form>
    </main>
  );
}




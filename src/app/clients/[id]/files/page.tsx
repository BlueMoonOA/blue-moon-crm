import { prisma } from "@/lib/prisma";
import FilesClient from "./FilesClient";

type Params = { params: { id: string } };

export default async function FilesPage({ params }: Params) {
  const clientId = params.id;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { name: true },
  });

  const files = await prisma.clientFile.findMany({
    where: { clientId },
    select: {
      id: true,
      displayName: true,
      ext: true,
      contentType: true,
      description: true,
      fileDate: true,
      bytes: true,
      createdAt: true,
      storedName: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        {client?.name ?? "Client"} — Files
      </h2>

      {/* Only the FilesClient row (compact buttons) */}
      <FilesClient clientId={clientId} files={files} initialFiles={files} />
    </div>
  );
}
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Appointment types (admin-manageable later, this is just starter data)
  const types = [
    { name: "Demo",      defaultDurationMin: 30, color: "#2563eb", sortOrder: 10, active: true },
    { name: "Training",  defaultDurationMin: 60, color: "#16a34a", sortOrder: 20, active: true },
    { name: "Strategy",  defaultDurationMin: 45, color: "#9333ea", sortOrder: 30, active: true },
  ];
  for (const t of types) {
    await prisma.appointmentType.upsert({
      where: { name: t.name },
      create: t,
      update: { ...t },
    });
  }

  // Flags
  const flags = [
    { name: "VIP",        color: "#f59e0b" },
    { name: "Follow Up",  color: "#ef4444" },
  ];
  for (const f of flags) {
    await prisma.flag.upsert({
      where: { name: f.name },
      create: f,
      update: { ...f },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });

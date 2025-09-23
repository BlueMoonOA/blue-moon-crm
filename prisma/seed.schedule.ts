import { prisma } from "../src/lib/prisma";

async function main() {
  const types = [
    { name:"Demo",      defaultDurationMin:30, color:"#2563eb", sortOrder:10, active:true },
    { name:"Training",  defaultDurationMin:60, color:"#16a34a", sortOrder:20, active:true },
    { name:"Strategy",  defaultDurationMin:45, color:"#9333ea", sortOrder:30, active:true },
  ];

  for (const t of types) {
    const existing = await prisma.appointment.findFirst({ where: { name: t.name } }).catch(() => null);
    if (existing) {
      await prisma.appointment.update({
        where: { id: existing.id },
        data:  { ...t },
      });
    } else {
      await prisma.appointment.create({ data: { ...t } });
    }
  }
}

main().catch((e)=>{ console.error(e); process.exit(1); }).finally(async()=>{ await prisma.$disconnect(); });
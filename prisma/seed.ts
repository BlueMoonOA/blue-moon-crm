// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const daysFromNow = (n: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return d;
};
const daysAgo = (n: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
};

async function main() {
  // start clean so the unique accountNumber values don't collide
  await prisma.appointment.deleteMany();
  await prisma.client.deleteMany();

  // NOTE: Your model requires `accountNumber` (string), so we provide it here
  const abby = await prisma.client.create({
    data: {
      accountNumber: "10002",
      name: "Abby Normal Optometry",
      address1: "104 Live Oak Dr",
      city: "Georgetown",
      state: "TX",
      zip: "78628",
      workPhone1: "512-409-4739",
      workPhone2: "512-111-2222",
      emails: ["frontdesk@abnormal.com", "billing@abnormal.com"],
      alert: "Has a hump",
      balanceCents: 231183, // $2,311.83
    },
    select: { id: true, accountNumber: true },
  });

  const dunaway = await prisma.client.create({
    data: {
      accountNumber: "10003",
      name: "Dunaway Vision",
      city: "Austin",
      state: "TX",
      workPhone1: "555-555-5555",
      emails: ["hello@dunawayvision.com"],
      balanceCents: 70236, // $702.36
    },
    select: { id: true, accountNumber: true },
  });

  // enums as strings to avoid TS friction
  await prisma.appointment.createMany({
    data: [
      {
        clientId: abby.id,
        startAt: daysFromNow(3, 9),
        durationMin: 60,
        type: "ONBOARDING",
        status: "SCHEDULED",
      },
      {
        clientId: abby.id,
        startAt: daysAgo(10, 14),
        durationMin: 45,
        type: "FOLLOW_UP",
        status: "COMPLETED",
      },
      {
        clientId: dunaway.id,
        startAt: daysFromNow(7, 11),
        durationMin: 90,
        type: "TRAINING",
        status: "SCHEDULED",
      },
    ],
  });

  console.log("✅ Seed complete:", {
    abby: abby.accountNumber,
    dunaway: dunaway.accountNumber,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });










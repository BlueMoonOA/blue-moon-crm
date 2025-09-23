-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "flagId" TEXT;

-- CreateTable
CREATE TABLE "public"."Flag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Flag_name_key" ON "public"."Flag"("name");

-- CreateIndex
CREATE INDEX "Appointment_consultantId_startAt_idx" ON "public"."Appointment"("consultantId", "startAt");

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "public"."Flag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

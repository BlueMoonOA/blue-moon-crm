/*
  Warnings:

  - You are about to drop the column `startsAt` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `startAt` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Appointment_clientId_startsAt_idx";

-- AlterTable
ALTER TABLE "public"."Appointment" DROP COLUMN "startsAt",
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Appointment_clientId_startAt_idx" ON "public"."Appointment"("clientId", "startAt");

-- CreateEnum
CREATE TYPE "public"."SpecialtyType" AS ENUM ('GENERAL_FULL', 'GENERAL_EXAM_ONLY', 'OPTICAL_ONLY', 'MYOPIA_MANAGEMENT', 'DRY_EYE', 'VISION_THERAPY', 'SPORTS_MEDICINE', 'PEDIATRIC', 'LOW_VISION', 'CONTACT_LENS', 'OCULAR_DISEASE', 'GLAUCOMA', 'RETINA', 'CORNEA', 'REFRACTIVE_SURGERY', 'OCULOPLASTICS', 'NEURO_OPHTHALMOLOGY', 'CATARACT', 'SURGERY_CENTER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AppointmentType" AS ENUM ('DEMO', 'TRAINING', 'STRATEGY', 'FOLLOW_UP', 'ONBOARDING', 'SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');

-- AlterTable
ALTER TABLE "public"."Deal" ADD COLUMN     "clientId" TEXT;

-- AlterTable
ALTER TABLE "public"."Lead" ADD COLUMN     "clientId" TEXT;

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "accountNo" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "workPhone1" TEXT,
    "workPhone2" TEXT,
    "fax" TEXT,
    "otherPhone" TEXT,
    "emails" TEXT[],
    "specialty" "public"."SpecialtyType",
    "secondary" "public"."SpecialtyType",
    "alert" TEXT,
    "balanceCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Appointment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "consultantId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "type" "public"."AppointmentType" NOT NULL DEFAULT 'OTHER',
    "status" "public"."AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_accountNo_key" ON "public"."Client"("accountNo");

-- CreateIndex
CREATE INDEX "Appointment_clientId_startsAt_idx" ON "public"."Appointment"("clientId", "startsAt");

-- CreateIndex
CREATE INDEX "Deal_clientId_idx" ON "public"."Deal"("clientId");

-- CreateIndex
CREATE INDEX "Lead_clientId_idx" ON "public"."Lead"("clientId");

-- AddForeignKey
ALTER TABLE "public"."Lead" ADD CONSTRAINT "Lead_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deal" ADD CONSTRAINT "Deal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

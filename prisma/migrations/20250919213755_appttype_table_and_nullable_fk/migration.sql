-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "appointmentTypeId" TEXT;

-- CreateTable
CREATE TABLE "public"."ApptType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultDurationMin" INTEGER NOT NULL DEFAULT 30,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApptType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApptType_name_key" ON "public"."ApptType"("name");

-- CreateIndex
CREATE INDEX "Appointment_appointmentTypeId_idx" ON "public"."Appointment"("appointmentTypeId");

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_appointmentTypeId_fkey" FOREIGN KEY ("appointmentTypeId") REFERENCES "public"."ApptType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

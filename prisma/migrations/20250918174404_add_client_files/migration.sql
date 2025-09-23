-- AlterEnum
ALTER TYPE "public"."RelatedType" ADD VALUE 'CLIENT';

-- AlterTable
ALTER TABLE "public"."File" ADD COLUMN     "description" TEXT,
ADD COLUMN     "scannedAt" TIMESTAMP(3);

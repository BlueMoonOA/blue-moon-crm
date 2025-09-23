/*
  Warnings:

  - You are about to drop the column `accountNo` on the `Client` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountNumber]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountNumber` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Client_accountNo_key";

-- AlterTable
ALTER TABLE "public"."Client" DROP COLUMN "accountNo",
ADD COLUMN     "accountNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Client_accountNumber_key" ON "public"."Client"("accountNumber");

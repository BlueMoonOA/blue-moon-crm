-- CreateTable
CREATE TABLE "public"."ClientFile" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "ext" TEXT NOT NULL,
    "contentType" TEXT,
    "description" TEXT,
    "fileDate" TIMESTAMP(3),
    "bytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientFile_clientId_createdAt_idx" ON "public"."ClientFile"("clientId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."ClientFile" ADD CONSTRAINT "ClientFile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

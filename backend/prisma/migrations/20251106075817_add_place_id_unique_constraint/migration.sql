/*
  Warnings:

  - A unique constraint covering the columns `[placeId]` on the table `contacts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "contacts_company_createdBy_key";

-- DropIndex
DROP INDEX "idx_custom_fields";

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN "placeId" TEXT;

-- CreateIndex
CREATE INDEX "idx_company_phone" ON "contacts"("company", "phone");

-- CreateIndex
CREATE INDEX "idx_company_email" ON "contacts"("company", "email");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_placeId_key" ON "contacts"("placeId");

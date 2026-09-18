-- AlterTable: add productName as nullable first (table has existing rows)
ALTER TABLE "Order" ADD COLUMN "productName" TEXT;

-- Backfill existing rows before enforcing NOT NULL
UPDATE "Order" SET "productName" = 'Unspecified Product' WHERE "productName" IS NULL;

-- Enforce NOT NULL now that all rows have a value
ALTER TABLE "Order" ALTER COLUMN "productName" SET NOT NULL;

-- CreateIndex: match schema.prisma's @unique on trackingNumber
CREATE UNIQUE INDEX "Order_trackingNumber_key" ON "Order"("trackingNumber");

-- CreateIndex: match schema.prisma's @@index([trackingNumber])
CREATE INDEX "Order_trackingNumber_idx" ON "Order"("trackingNumber");

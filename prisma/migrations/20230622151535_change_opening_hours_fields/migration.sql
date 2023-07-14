/*
  Warnings:

  - You are about to drop the column `lunchClosing` on the `opening_hours` table. All the data in the column will be lost.
  - You are about to drop the column `lunchOpening` on the `opening_hours` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "opening_hours" DROP COLUMN "lunchClosing",
DROP COLUMN "lunchOpening",
ADD COLUMN     "lunch_closing" TEXT,
ADD COLUMN     "lunch_opening" TEXT;

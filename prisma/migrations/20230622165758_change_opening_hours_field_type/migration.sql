/*
  Warnings:

  - The `lunch_closing` column on the `opening_hours` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lunch_opening` column on the `opening_hours` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `opening` on the `opening_hours` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `closing` on the `opening_hours` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "opening_hours" DROP COLUMN "opening",
ADD COLUMN     "opening" INTEGER NOT NULL,
DROP COLUMN "closing",
ADD COLUMN     "closing" INTEGER NOT NULL,
DROP COLUMN "lunch_closing",
ADD COLUMN     "lunch_closing" INTEGER,
DROP COLUMN "lunch_opening",
ADD COLUMN     "lunch_opening" INTEGER;

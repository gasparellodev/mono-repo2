/*
  Warnings:

  - Made the column `value_per_hour` on table `courts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "courts" ALTER COLUMN "value_per_hour" SET NOT NULL;

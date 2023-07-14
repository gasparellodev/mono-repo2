/*
  Warnings:

  - You are about to drop the column `closing_time` on the `arenas` table. All the data in the column will be lost.
  - You are about to drop the column `opening_time` on the `arenas` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `reservations` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DaysWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- AlterTable
ALTER TABLE "arenas" DROP COLUMN "closing_time",
DROP COLUMN "opening_time";

-- AlterTable
ALTER TABLE "reservations" DROP COLUMN "end_time",
DROP COLUMN "start_time";

-- CreateTable
CREATE TABLE "opening_hours" (
    "id" TEXT NOT NULL,
    "week_day" "DaysWeek" NOT NULL,
    "opening" TEXT NOT NULL,
    "closing" TEXT NOT NULL,
    "lunchClosing" TEXT,
    "lunchOpening" TEXT,
    "arena_id" TEXT NOT NULL,

    CONSTRAINT "opening_hours_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "opening_hours" ADD CONSTRAINT "opening_hours_arena_id_fkey" FOREIGN KEY ("arena_id") REFERENCES "arenas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

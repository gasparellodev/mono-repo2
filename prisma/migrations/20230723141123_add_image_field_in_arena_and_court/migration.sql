/*
  Warnings:

  - The values [CANCELLEB_BY_MANAGER_OR_OWNER] on the enum `ReservationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReservationStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED_BY_TRANSACTION', 'CANCELLED_BY_USER', 'CANCELLED_BY_MANAGER_OR_OWNER');
ALTER TABLE "reservations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "reservations" ALTER COLUMN "status" TYPE "ReservationStatus_new" USING ("status"::text::"ReservationStatus_new");
ALTER TYPE "ReservationStatus" RENAME TO "ReservationStatus_old";
ALTER TYPE "ReservationStatus_new" RENAME TO "ReservationStatus";
DROP TYPE "ReservationStatus_old";
ALTER TABLE "reservations" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "arenas" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "courts" ADD COLUMN     "image" TEXT;

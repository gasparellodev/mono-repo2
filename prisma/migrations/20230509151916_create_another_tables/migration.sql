-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('BEACH_TENNIS', 'BASKETBALL_HALL', 'FOOT_VOLLEY', 'FUTSAL_HALL', 'HANDBALL_HALL', 'VOLLEYBALL', 'SOCIETY_SYNTHETIC', 'TENNIS');

-- CreateEnum
CREATE TYPE "RecurrenceInterval" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED_BY_TRANSACTION', 'CANCELLED_BY_USER', 'CANCELLEB_BY_MANAGER_OR_OWNER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'UNPAID');

-- AlterTable
ALTER TABLE "crendentials" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "arenas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "is_validated" TIMESTAMP(3),
    "opening_time" TIME,
    "closing_time" TIME,
    "address_id" TEXT NOT NULL,

    CONSTRAINT "arenas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adresses" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lat" DECIMAL(65,30) NOT NULL,
    "lon" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "adresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value_per_hour" DECIMAL(65,30),
    "type_court" TEXT NOT NULL,
    "sport_type" "SportType" NOT NULL,
    "dimensions" TEXT,
    "covered_court" BOOLEAN NOT NULL DEFAULT false,
    "court_digital_timer" BOOLEAN NOT NULL DEFAULT false,
    "court_cam_replay" BOOLEAN NOT NULL DEFAULT false,
    "arena_id" TEXT NOT NULL,

    CONSTRAINT "courts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "court_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recurrence_id" TEXT,
    "is_recurring" BOOLEAN DEFAULT false,
    "payment" "PaymentStatus" DEFAULT 'UNPAID',

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurrences" (
    "id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "interval" "RecurrenceInterval" NOT NULL,

    CONSTRAINT "recurrences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "arenas_cnpj_key" ON "arenas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "arenas_address_id_key" ON "arenas"("address_id");

-- AddForeignKey
ALTER TABLE "arenas" ADD CONSTRAINT "arenas_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "adresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courts" ADD CONSTRAINT "courts_arena_id_fkey" FOREIGN KEY ("arena_id") REFERENCES "arenas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_recurrence_id_fkey" FOREIGN KEY ("recurrence_id") REFERENCES "recurrences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

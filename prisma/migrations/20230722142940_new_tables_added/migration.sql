-- CreateEnum
CREATE TYPE "PaymentGatewayType" AS ENUM ('MERCADO_PAGO');

-- CreateTable
CREATE TABLE "payment_gateways" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "type" "PaymentGatewayType",
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_in" INTEGER,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arena_id" TEXT NOT NULL,

    CONSTRAINT "payment_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateways_state_key" ON "payment_gateways"("state");

-- AddForeignKey
ALTER TABLE "payment_gateways" ADD CONSTRAINT "payment_gateways_arena_id_fkey" FOREIGN KEY ("arena_id") REFERENCES "arenas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

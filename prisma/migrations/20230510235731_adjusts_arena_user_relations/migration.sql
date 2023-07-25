/*
  Warnings:

  - Added the required column `owner_id` to the `arenas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "arenas" ADD COLUMN     "owner_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "arenas_managers" (
    "id" SERIAL NOT NULL,
    "arena_id" TEXT NOT NULL,
    "manager_id" TEXT NOT NULL,

    CONSTRAINT "arenas_managers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "arenas_managers" ADD CONSTRAINT "arenas_managers_arena_id_fkey" FOREIGN KEY ("arena_id") REFERENCES "arenas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arenas_managers" ADD CONSTRAINT "arenas_managers_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arenas" ADD CONSTRAINT "arenas_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

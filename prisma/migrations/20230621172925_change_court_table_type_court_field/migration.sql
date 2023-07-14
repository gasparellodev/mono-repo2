/*
  Warnings:

  - Changed the type of `type_court` on the `courts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TypeCourt" AS ENUM ('SAND', 'GRAVEL', 'HALL', 'NATURAL_GRASS', 'SYNTHETIC_GRASS');

-- AlterTable
ALTER TABLE "courts" DROP COLUMN "type_court",
ADD COLUMN     "type_court" "TypeCourt" NOT NULL;

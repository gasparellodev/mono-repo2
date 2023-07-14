-- CreateEnum
CREATE TYPE "FavoriteSport" AS ENUM ('BEACH_TENNIS', 'BASKETBALL_HALL', 'FOOT_VOLLEY', 'FUTSAL_HALL', 'HANDBALL_HALL', 'VOLLEYBALL', 'SOCIETY_SYNTHETIC', 'TENNIS', 'NONE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLAYER', 'ARENA', 'ADMIN');

-- CreateEnum
CREATE TYPE "FavoriteTime" AS ENUM ('MORNING', 'AFTERNOON', 'NIGHT', 'NONE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "cellphone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar" TEXT,
    "cpf" TEXT,
    "favorite_sport" "FavoriteSport" NOT NULL,
    "favorite_time" "FavoriteTime" NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'PLAYER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crendentials" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "last_password" TEXT NOT NULL DEFAULT '',
    "password_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "crendentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crendentials_user_id_key" ON "crendentials"("user_id");

-- AddForeignKey
ALTER TABLE "crendentials" ADD CONSTRAINT "crendentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

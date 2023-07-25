-- CreateEnum
CREATE TYPE "OAuthProviderType" AS ENUM ('LOCAL', 'GOOGLE', 'APPLE');

-- CreateTable
CREATE TABLE "oauth_providers" (
    "provider" "OAuthProviderType" NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_providers_pkey" PRIMARY KEY ("provider","user_id")
);

-- AddForeignKey
ALTER TABLE "oauth_providers" ADD CONSTRAINT "oauth_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

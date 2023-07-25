-- CreateTable
CREATE TABLE "blacklist_tokens" (
    "token_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "blacklist_tokens_pkey" PRIMARY KEY ("token_id","user_id")
);

-- AddForeignKey
ALTER TABLE "blacklist_tokens" ADD CONSTRAINT "blacklist_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

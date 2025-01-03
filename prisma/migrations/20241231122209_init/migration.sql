-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "account";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateEnum
CREATE TYPE "account"."Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "auth"."Provider" AS ENUM ('CREDENTIAL', 'GOOGLE', 'GITHUB');

-- CreateTable
CREATE TABLE "account"."users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "role" "account"."Role" NOT NULL DEFAULT 'USER',
    "last_login" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."authentications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email_hash" TEXT NOT NULL,
    "email_encrypted" TEXT NOT NULL,
    "password" TEXT,
    "provider" "auth"."Provider" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "authentications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authentications_email_hash_key" ON "auth"."authentications"("email_hash");

-- CreateIndex
CREATE UNIQUE INDEX "authentications_user_id_provider_key" ON "auth"."authentications"("user_id", "provider");

-- AddForeignKey
ALTER TABLE "auth"."authentications" ADD CONSTRAINT "authentications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "account"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

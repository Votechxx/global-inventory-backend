/*
  Warnings:

  - The values [WORKER,GUARD] on the enum `RoleEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoleEnum_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "RoleEnum_new" USING ("role"::text::"RoleEnum_new");
ALTER TYPE "RoleEnum" RENAME TO "RoleEnum_old";
ALTER TYPE "RoleEnum_new" RENAME TO "RoleEnum";
DROP TYPE "RoleEnum_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

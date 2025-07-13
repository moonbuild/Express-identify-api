/*
  Warnings:

  - The `linkPrecedence` column on the `Contact` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "bitespeed"."LinkPrecedence" AS ENUM ('primary', 'secondary');

-- AlterTable
ALTER TABLE "bitespeed"."Contact" DROP COLUMN "linkPrecedence",
ADD COLUMN     "linkPrecedence" "bitespeed"."LinkPrecedence" NOT NULL DEFAULT 'primary';

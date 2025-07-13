/*
  Warnings:

  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bitespeed"."Contact" DROP CONSTRAINT "Contact_linkedId_fkey";

-- DropTable
DROP TABLE "bitespeed"."Contact";

-- CreateTable
CREATE TABLE "bitespeed"."Contacts" (
    "id" SERIAL NOT NULL,
    "phoneNumber" VARCHAR(255),
    "email" VARCHAR(255),
    "linkedId" INTEGER,
    "linkPrecedence" "bitespeed"."LinkPrecedence" NOT NULL DEFAULT 'primary',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bitespeed"."Contacts" ADD CONSTRAINT "Contacts_linkedId_fkey" FOREIGN KEY ("linkedId") REFERENCES "bitespeed"."Contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

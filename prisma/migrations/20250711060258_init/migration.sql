-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "bitespeed";

-- CreateTable
CREATE TABLE "bitespeed"."Contact" (
    "id" SERIAL NOT NULL,
    "phoneNumber" VARCHAR(255),
    "email" VARCHAR(255),
    "linkedId" INTEGER,
    "linkPrecedence" TEXT NOT NULL DEFAULT 'primary',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bitespeed"."Contact" ADD CONSTRAINT "Contact_linkedId_fkey" FOREIGN KEY ("linkedId") REFERENCES "bitespeed"."Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

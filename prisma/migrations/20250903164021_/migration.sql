/*
  Warnings:

  - You are about to drop the `authority` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ReportAuthority" DROP CONSTRAINT "ReportAuthority_authorityId_fkey";

-- DropTable
DROP TABLE "public"."authority";

-- CreateTable
CREATE TABLE "public"."Authority" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."AuthorityType" NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "submittedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Authority_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ReportAuthority" ADD CONSTRAINT "ReportAuthority_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "public"."Authority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

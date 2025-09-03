-- CreateEnum
CREATE TYPE "public"."AuthorityType" AS ENUM ('GOVERNMENT', 'NGO', 'OTHERS');

-- CreateEnum
CREATE TYPE "public"."ContactStatus" AS ENUM ('PENDING', 'CONTACTED', 'RESPONDED', 'NO_RESPONSE');

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

-- CreateTable
CREATE TABLE "public"."ReportAuthority" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "authorityId" TEXT NOT NULL,
    "volunteer" TEXT,
    "status" "public"."ContactStatus" NOT NULL DEFAULT 'PENDING',
    "contactedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportAuthority_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ReportAuthority" ADD CONSTRAINT "ReportAuthority_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportAuthority" ADD CONSTRAINT "ReportAuthority_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "public"."Authority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

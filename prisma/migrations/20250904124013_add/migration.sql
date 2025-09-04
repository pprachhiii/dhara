/*
  Warnings:

  - You are about to drop the column `date` on the `Drive` table. All the data in the column will be lost.
  - You are about to drop the column `assignedTo` on the `Task` table. All the data in the column will be lost.
  - Added the required column `startDate` to the `Drive` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."DriveStatus" AS ENUM ('PLANNED', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."BeautifyType" AS ENUM ('TREE_PLANTING', 'WALL_PAINTING', 'SIGNAGE', 'CLEANUP', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MonitoringStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ESCALATED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ReportStatus" ADD VALUE 'ELIGIBLE_AUTHORITY';
ALTER TYPE "public"."ReportStatus" ADD VALUE 'ELIGIBLE_DRIVE';

-- AlterTable
ALTER TABLE "public"."Drive" DROP COLUMN "date",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "public"."DriveStatus" NOT NULL DEFAULT 'PLANNED';

-- AlterTable
ALTER TABLE "public"."Report" ADD COLUMN     "eligibleAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."ReportAuthority" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Task" DROP COLUMN "assignedTo",
ADD COLUMN     "volunteerId" TEXT;

-- CreateTable
CREATE TABLE "public"."ReportVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Beautification" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "type" "public"."BeautifyType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Beautification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Monitoring" (
    "id" TEXT NOT NULL,
    "driveId" TEXT,
    "reportId" TEXT,
    "status" "public"."MonitoringStatus" NOT NULL DEFAULT 'ACTIVE',
    "checkDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Monitoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Volunteer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_email_key" ON "public"."Volunteer"("email");

-- AddForeignKey
ALTER TABLE "public"."ReportVote" ADD CONSTRAINT "ReportVote_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "public"."Volunteer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Beautification" ADD CONSTRAINT "Beautification_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "public"."Drive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Monitoring" ADD CONSTRAINT "Monitoring_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "public"."Drive"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Monitoring" ADD CONSTRAINT "Monitoring_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

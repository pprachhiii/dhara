/*
  Warnings:

  - You are about to drop the `DriveDiscussion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReportDiscussion` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."DiscussionPhase" AS ENUM ('REPORT_VOTING', 'DRIVE_VOTING');

-- DropForeignKey
ALTER TABLE "public"."DriveDiscussion" DROP CONSTRAINT "DriveDiscussion_driveId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReportDiscussion" DROP CONSTRAINT "ReportDiscussion_reportId_fkey";

-- DropTable
DROP TABLE "public"."DriveDiscussion";

-- DropTable
DROP TABLE "public"."ReportDiscussion";

-- CreateTable
CREATE TABLE "public"."Discussion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phase" "public"."DiscussionPhase" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Discussion_pkey" PRIMARY KEY ("id")
);

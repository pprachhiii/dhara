/*
  Warnings:

  - You are about to drop the column `volunteer` on the `ReportAuthority` table. All the data in the column will be lost.
  - You are about to drop the `Vote` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,reportId]` on the table `ReportVote` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."DriveStatus" ADD VALUE 'VOTING_FINALIZED';

-- AlterEnum
ALTER TYPE "public"."ReportStatus" ADD VALUE 'VOTING_FINALIZED';

-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_driveId_fkey";

-- AlterTable
ALTER TABLE "public"."Drive" ADD COLUMN     "finalVoteCount" INTEGER,
ADD COLUMN     "votingCloseAt" TIMESTAMP(3),
ADD COLUMN     "votingOpenAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Report" ADD COLUMN     "finalVoteCount" INTEGER,
ADD COLUMN     "votingCloseAt" TIMESTAMP(3),
ADD COLUMN     "votingOpenAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."ReportAuthority" DROP COLUMN "volunteer",
ADD COLUMN     "volunteerId" TEXT;

-- DropTable
DROP TABLE "public"."Vote";

-- CreateTable
CREATE TABLE "public"."ReportDiscussion" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportDiscussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriveVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriveVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriveDiscussion" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriveDiscussion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriveVote_userId_driveId_key" ON "public"."DriveVote"("userId", "driveId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportVote_userId_reportId_key" ON "public"."ReportVote"("userId", "reportId");

-- AddForeignKey
ALTER TABLE "public"."ReportDiscussion" ADD CONSTRAINT "ReportDiscussion_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriveVote" ADD CONSTRAINT "DriveVote_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "public"."Drive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriveDiscussion" ADD CONSTRAINT "DriveDiscussion_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "public"."Drive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

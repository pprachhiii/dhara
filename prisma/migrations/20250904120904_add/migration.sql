/*
  Warnings:

  - Added the required column `updatedAt` to the `Drive` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Drive" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "driveId" TEXT,
ADD COLUMN     "timeSlot" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."DriveReport" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,

    CONSTRAINT "DriveReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "public"."Drive"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriveReport" ADD CONSTRAINT "DriveReport_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "public"."Drive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriveReport" ADD CONSTRAINT "DriveReport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "public"."Drive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `submittedBy` on the `Authority` table. All the data in the column will be lost.
  - You are about to drop the column `reporter` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Volunteer` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Volunteer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Volunteer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reporterId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Volunteer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'VOLUNTEER');

-- DropIndex
DROP INDEX "public"."Volunteer_email_key";

-- AlterTable
ALTER TABLE "public"."Authority" DROP COLUMN "submittedBy",
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Report" DROP COLUMN "reporter",
ADD COLUMN     "reporterId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Task" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Volunteer" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_userId_key" ON "public"."Volunteer"("userId");

-- AddForeignKey
ALTER TABLE "public"."Volunteer" ADD CONSTRAINT "Volunteer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportVote" ADD CONSTRAINT "ReportVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriveVote" ADD CONSTRAINT "DriveVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportAuthority" ADD CONSTRAINT "ReportAuthority_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "public"."Volunteer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Discussion" ADD CONSTRAINT "Discussion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

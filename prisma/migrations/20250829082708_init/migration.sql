-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('PENDING', 'AUTHORITY_CONTACTED', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('OPEN', 'ASSIGNED', 'DONE');

-- CreateEnum
CREATE TYPE "public"."SocializingLevel" AS ENUM ('SOLO', 'DUAL', 'GROUP');

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "comfort" "public"."SocializingLevel" NOT NULL,
    "assignedTo" TEXT,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Drive" (
    "id" TEXT NOT NULL,
    "participant" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drive_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

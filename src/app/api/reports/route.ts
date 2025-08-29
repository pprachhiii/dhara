import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReportStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  // Cast string to ReportStatus if valid
  const status = statusParam && Object.values(ReportStatus).includes(statusParam as ReportStatus)
    ? (statusParam as ReportStatus)
    : undefined;

  const reports = await prisma.report.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reports);
}

export async function POST(request:NextRequest){
    const data = await request.json();
    const newReport = await prisma.report.create({
        data:{
            reporter:data.reporter,
            title:data.title,
            description:data.description,
            imageUrl:data.imageUrl,
        }
    })
    return NextResponse.json(newReport);
}
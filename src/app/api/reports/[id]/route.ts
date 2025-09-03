import { Context } from "@/lib/context";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/reports/:id
export async function GET(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;
    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
}

// PATCH /api/reports/:id
export async function PATCH(
  request: NextRequest,
  context: Context
) {
  const { id } = await context.params;
  const data = await request.json();

  try {
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        reporter: data.reporter,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
      },
    });

    return NextResponse.json(updatedReport);
  } catch {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
}

// DELETE /api/reports/:id
export async function DELETE(
  request: NextRequest,
  context: Context
) {
  const { id } = await context.params;

  try {
    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ message: "Report deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
}

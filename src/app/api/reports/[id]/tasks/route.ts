import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Context } from "@/lib/context"; 

export async function GET(
  req: Request,
  context: Context
) {
  const { id } = await context.params;

  try {
    const tasks = await prisma.task.findMany({
      where: { reportId: id },
      include: {
        volunteer: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

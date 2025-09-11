import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Context } from "@/lib/context";
import { TaskStatus, SocializingLevel } from "@prisma/client";
import { requireAuth } from "@/lib/serverAuth";

// GET /api/tasks/:id (public for now)
export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        report: true,
        drive: true,
        volunteer: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (err) {
    console.error("Error fetching task:", err);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

// PATCH /api/tasks/:id (requires auth)
export async function PATCH(request: NextRequest, context: Context) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const { id } = await context.params;
    const data = await request.json();

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        volunteerId: data.volunteerId ?? undefined,
        comfort: data.comfort ? (data.comfort as SocializingLevel) : undefined,
        timeSlot: data.timeSlot ? new Date(data.timeSlot) : undefined,
        status: data.status ? (data.status as TaskStatus) : undefined,
      },
      include: {
        report: true,
        drive: true,
        volunteer: true,
      },
    });

    return NextResponse.json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (err) {
    console.error("Error updating task:", err);
    return NextResponse.json({ error: "Task not found or update failed" }, { status: 404 });
  }
}

// DELETE /api/tasks/:id (requires auth)
export async function DELETE(request: NextRequest, context: Context) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const { id } = await context.params;

    // Optional: add logic to restrict who can delete (admin only or task owner)
    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
}

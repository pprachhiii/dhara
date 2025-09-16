import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/serverAuth";

type AuthResponse = {
  error: boolean;
  user?: { id: string; email: string };
  response?: NextResponse;
};

export async function GET() {
  try {
    const volunteers = await prisma.volunteer.findMany({
      orderBy: { joinedAt: "desc" },
      include: { tasks: true, user: true },
    });

    return NextResponse.json(volunteers);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch volunteers" },
      { status: 500 }
    );
  }
}

/**
 * Registers the authenticated user as a volunteer for a drive.
 * Blocks duplicate volunteering in the same drive.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { driveId: string } }
) {
  const authResult = (await requireAuth(req)) as AuthResponse;
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const { driveId } = params;
    const userId = authResult.user.id;

    // ✅ Ensure user has a volunteer profile
    let volunteer = await prisma.volunteer.findUnique({
      where: { userId },
    });

    if (!volunteer) {
      volunteer = await prisma.volunteer.create({
        data: { userId },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { role: "VOLUNTEER" },
      });
    }

    // ❌ Block if already volunteering in this drive
    const existingTask = await prisma.task.findFirst({
      where: {
        driveId,
        volunteerId: volunteer.id,
      },
    });

    if (existingTask) {
      return NextResponse.json(
        { error: "You are already volunteering in this drive" },
        { status: 400 }
      );
    }

    // ✅ Otherwise, create a volunteer Task
    // NOTE: reportId and comfort are required by schema, so we provide defaults
    const placeholderReport = await prisma.report.findFirst();
    if (!placeholderReport) {
      return NextResponse.json(
        { error: "No report available to link volunteer task" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        reportId: placeholderReport.id, // required
        driveId,
        volunteerId: volunteer.id,
        title: "Volunteer Participation",
        description: "User joined as a volunteer for this drive",
        comfort: "GROUP", // default enum value
      },
    });

    return NextResponse.json(
      { message: "You are now volunteering in this drive!", task },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/volunteers error:", err);
    return NextResponse.json(
      { error: "Failed to volunteer for this drive" },
      { status: 500 }
    );
  }
}

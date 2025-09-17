import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error || !auth.user) return auth.response!;

  try {
    const { driveId, reportId }: { driveId?: string; reportId?: string } = await req.json();
    const userId = auth.user.id;

    // 1️⃣ Ensure volunteer profile + role switch
    let volunteer = await prisma.volunteer.findUnique({ where: { userId } });
    if (!volunteer) {
      volunteer = await prisma.volunteer.create({ data: { userId } });
      await prisma.user.update({
        where: { id: userId },
        data: { role: "VOLUNTEER" },
      });
    }

    // 2️⃣ Link to drive if provided
    if (driveId) {
      const exists = await prisma.driveVolunteer.findUnique({
        where: { driveId_volunteerId: { driveId, volunteerId: volunteer.id } },
      });
      if (!exists) {
        await prisma.driveVolunteer.create({ data: { driveId, volunteerId: volunteer.id } });
      }
    }

    // 3️⃣ Link to report if provided
    if (reportId) {
      const ra = await prisma.reportAuthority.findFirst({ where: { reportId } });
      if (ra && !ra.volunteerId) {
        await prisma.reportAuthority.update({
          where: { id: ra.id },
          data: { volunteerId: volunteer.id, status: "CONTACTED", contactedAt: new Date() },
        });
      }
    }

    return NextResponse.json({ message: "You are now a volunteer!" }, { status: 200 });
  } catch (err) {
    console.error("POST /api/volunteer error:", err);
    return NextResponse.json({ error: "Failed to volunteer" }, { status: 500 });
  }
}

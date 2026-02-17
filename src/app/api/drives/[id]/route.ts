import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Context } from '@/lib/context';
import { requireAuth } from '@/lib/serverAuth';

// -------------------- GET /api/drives/:id --------------------
export async function GET(request: NextRequest, context: Context) {
  const { id } = await context.params;

  try {
    const drive = await prisma.drive.findUnique({
      where: { id },
      include: {
        reports: { include: { report: true } },
        tasks: true,
        driveVolunteers: {
          include: { volunteer: { include: { user: true } } },
        },
        discussions: { include: { user: true } },
        unifiedVotes: { include: { user: true } },
        enhancements: true,
        monitorings: true,
      },
    });

    if (!drive) {
      return NextResponse.json({ error: 'Drive not found' }, { status: 404 });
    }

    return NextResponse.json(drive);
  } catch (err) {
    console.error('Error fetching drive:', err);
    return NextResponse.json({ error: 'Failed to fetch drive' }, { status: 500 });
  }
}

// -------------------- PATCH /api/drives/:id --------------------
export async function PATCH(request: NextRequest, context: Context) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const { id } = await context.params;
    const data = await request.json();

    const updatedDrive = await prisma.drive.update({
      where: { id },
      data: {
        title: typeof data.title === 'string' ? data.title : undefined,
        description: typeof data.description === 'string' ? data.description : undefined,
        category: typeof data.category === 'string' ? data.category : undefined,
        participant: Number.isFinite(Number(data.participant))
          ? Number(data.participant)
          : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        startTime: typeof data.startTime === 'string' ? data.startTime : undefined,
        durationHr: Number.isFinite(Number(data.durationHr)) ? Number(data.durationHr) : undefined,
        area: data.location?.area,
        wardNumber: data.location?.wardNumber,
        city: data.location?.city,
        pinCode: data.location?.pinCode,
        directions: data.location?.directions,
        status: data.status,
      },
      include: {
        reports: { include: { report: true } },
        tasks: true,
        driveVolunteers: {
          include: { volunteer: { include: { user: true } } },
        },
        discussions: { include: { user: true } },
        unifiedVotes: { include: { user: true } },
        enhancements: true,
        monitorings: true,
      },
    });

    return NextResponse.json({
      message: 'Drive updated successfully',
      drive: updatedDrive,
    });
  } catch (err) {
    console.error('Error updating drive:', err);
    return NextResponse.json({ error: 'Drive update failed' }, { status: 500 });
  }
}

// -------------------- DELETE /api/drives/:id --------------------
export async function DELETE(request: NextRequest, context: Context) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const { id } = await context.params;

    // Delete child entities first
    await prisma.task.deleteMany({ where: { driveId: id } });
    await prisma.driveReport.deleteMany({ where: { driveId: id } });
    await prisma.vote.deleteMany({ where: { driveId: id } });
    await prisma.enhancement.deleteMany({ where: { driveId: id } });
    await prisma.monitoring.deleteMany({ where: { driveId: id } });
    await prisma.driveVolunteer.deleteMany({ where: { driveId: id } });
    await prisma.discussion.deleteMany({ where: { driveId: id } });

    // Delete the drive
    await prisma.drive.delete({ where: { id } });

    return NextResponse.json({ message: 'Drive deleted successfully' });
  } catch (err) {
    console.error('Error deleting drive:', err);
    return NextResponse.json({ error: 'Failed to delete drive' }, { status: 500 });
  }
}

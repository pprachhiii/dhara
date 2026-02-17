import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromPage } from '@/lib/pageAuth';
import { EmptyContext } from '@/lib/context';

export async function POST(request: NextRequest, context: EmptyContext) {
  const user = await getUserFromPage();
  const { id } = await context.params;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    const discussion = await prisma.discussion.create({
      data: {
        content: content.trim(),
        phase: 'GENERAL',
        driveId: id,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(discussion, { status: 201 });
  } catch (error) {
    console.error('Error posting discussion:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}

export async function GET() {
  const user = await getUserFromPage();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  const volunteer = await prisma.volunteer.findUnique({
    where: { userId },
    select: { id: true },
  });

  const [myReports, drivesJoined, activeMonitorings, completedDrives] = await Promise.all([
    prisma.report.count({
      where: { reporterId: userId },
    }),

    volunteer
      ? prisma.driveVolunteer.count({
          where: { volunteerId: volunteer.id },
        })
      : 0,

    volunteer
      ? prisma.monitoring.count({
          where: {
            volunteerId: volunteer.id,
            status: 'ACTIVE',
          },
        })
      : 0,

    prisma.driveCompletion.count({
      where: { completedById: userId },
    }),
  ]);

  return NextResponse.json({
    myReports,
    drivesJoined,
    activeMonitorings,
    completedDrives,
  });
}

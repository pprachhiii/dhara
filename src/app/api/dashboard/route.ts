import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getUserFromPage } from '@/lib/pageAuth';

export async function GET() {
  const pageUser = await getUserFromPage();
  if (!pageUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: pageUser.id },
    select: {
      id: true,
      name: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  /* ---------------- USER DATA ---------------- */
  const reports =
    (await prisma.report.findMany({
      where: { reporterId: user.id },
      include: {
        tasks: true,
        reportAuthorities: true,
        drives: { select: { id: true } },
        unifiedVotes: true,
      },
    })) || [];

  const drives =
    (await prisma.drive.findMany({
      where: {
        driveVolunteers: {
          some: {
            volunteer: { userId: user.id },
          },
        },
      },
      include: {
        tasks: true,
        driveVolunteers: true,
      },
    })) || [];

  const priorityReports =
    (await prisma.report.findMany({
      where: { status: 'PENDING' },
      include: {
        tasks: true,
        reportAuthorities: true,
        drives: { select: { id: true } },
        unifiedVotes: true,
      },
      take: 6,
    })) || [];

  /* ---------------- COMMUNITY METRICS ---------------- */
  const reportsThisWeek =
    (await prisma.report.count({
      where: { createdAt: { gte: oneWeekAgo } },
    })) || 0;

  const totalReports = (await prisma.report.count()) || 0;
  const resolvedReports =
    (await prisma.report.count({
      where: { status: 'RESOLVED' },
    })) || 0;

  const resolutionRate =
    totalReports === 0 ? 0 : Math.round((resolvedReports / totalReports) * 100);

  const activeVolunteers =
    (await prisma.volunteer.count({
      where: {
        driveVolunteers: {
          some: { joinedAt: { gte: thirtyDaysAgo } },
        },
      },
    })) || 0;

  /* ---------------- RETURN ---------------- */
  return NextResponse.json({
    user,
    reports,
    drives,
    priorityReports,
    community: {
      reportsThisWeek,
      resolutionRate,
      activeVolunteers,
    },
  });
}

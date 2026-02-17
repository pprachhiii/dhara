import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const activeReports = await prisma.report.count({
    where: { status: { not: 'RESOLVED' } },
  });

  const activeDrives = await prisma.drive.count({
    where: { status: 'ONGOING' },
  });

  const completedReports = await prisma.report.count({
    where: { status: 'RESOLVED' },
  });

  const activeVolunteers = await prisma.volunteer.count();

  return NextResponse.json({
    activeReports,
    activeDrives,
    completedReports,
    activeVolunteers,
  });
}

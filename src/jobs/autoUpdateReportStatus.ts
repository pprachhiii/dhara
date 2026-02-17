import { prisma } from '@/lib/prisma';

export async function autoUpdatePendingReports() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const updated = await prisma.report.updateMany({
    where: {
      status: 'PENDING',
      createdAt: {
        lt: sevenDaysAgo,
      },
    },
    data: {
      status: 'ELIGIBLE_FOR_DRIVE',
    },
  });

  console.log(`Updated ${updated.count} reports to ELIGIBLE_FOR_DRIVE`);
}

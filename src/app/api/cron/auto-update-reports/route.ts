import { autoUpdatePendingReports } from '@/jobs/autoUpdateReportStatus';

export async function GET() {
  await autoUpdatePendingReports();
  return Response.json({ success: true });
}

// app/page.tsx
import HomePageClient from "@/components/HomePageClient";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [reports, drives, volunteers] = await Promise.all([
    prisma.report.findMany({ include: { reporter: true } }),
    prisma.drive.findMany(),
    prisma.volunteer.findMany({ include: { user: true } }), // ✅ FIX HERE
  ]);

  return (
    <HomePageClient
      initialReports={reports}
      initialDrives={drives}
      initialVolunteers={volunteers}
    />
  );
}

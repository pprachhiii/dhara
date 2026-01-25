// components/home/featured-reports.tsx
import { prisma } from "@/lib/prisma"
import { ReportCard } from "@/components/ReportCard"
import type { Report } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export async function FeaturedReports() {
  const reports = await prisma.report.findMany({
    where: {
      status: {
        in: ["ELIGIBLE_FOR_VOTE", "VOTING_FINALIZED", "ELIGIBLE_FOR_DRIVE"],
      },
    },
    include: {
      reporter: true,
      unifiedVotes: true,
      tasks: true,
      reportAuthorities: true,
      drives: { select: { id: true } },
    },
    take: 6,
  })

  const typedReports = reports as unknown as Report[]

  return (
    <section className="border-t bg-secondary/30 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Priority Issues</h2>
            <p className="text-muted-foreground">
              High-impact reports needing community attention
            </p>
          </div>

          <Link href="/reports">
            <Button variant="outline" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Content */}
        {typedReports.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No priority reports yet.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {typedReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

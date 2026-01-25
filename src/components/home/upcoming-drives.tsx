import { prisma } from "@/lib/prisma"
import { DriveCard } from "@/components/DriveCard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export async function UpcomingDrives() {
  const drives = await prisma.drive.findMany({
    where: {
      status: { in: ["PLANNED", "VOTING_FINALIZED"] },
      startDate: { gte: new Date() },
    },
    orderBy: { startDate: "asc" },
    take: 4,
  })

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Upcoming Drives</h2>
            <p className="text-muted-foreground">
              Community actions scheduled ahead
            </p>
          </div>

          <Link href="/drives">
            <Button variant="outline" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Content */}
        {drives.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No upcoming drives yet. Stay tuned!
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {drives.map((drive) => (
              <DriveCard key={drive.id} drive={drive} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

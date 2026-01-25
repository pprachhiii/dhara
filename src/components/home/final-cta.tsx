import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, BarChart3 } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="border-t bg-secondary/30 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold">
          Ready to Make a Difference?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Join thousands of citizens working together to improve their
          neighborhoods. Every report, every vote, every action counts.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/reports/new">
            <Button size="lg" className="gap-2">
              <FileText className="h-5 w-5" />
              Report Your First Issue
            </Button>
          </Link>

          <Link href="/voting">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 bg-transparent"
            >
              <BarChart3 className="h-5 w-5" />
              View Voting Hub
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

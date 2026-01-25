import { prisma } from "@/lib/prisma"
import { TreePine } from "lucide-react"

export async function ImpactSection() {
  const [resolved, total, trees] = await Promise.all([
    prisma.report.count({ where: { status: "RESOLVED" } }),
    prisma.report.count(),
    prisma.enhancement.count({
      where: { type: "TREE_PLANTING" },
    }),
  ])

  const resolutionRate =
    total > 0 ? Math.round((resolved / total) * 100) : 0

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid gap-8 text-center md:grid-cols-3">
      <div>
        <div className="text-4xl font-bold text-primary">
          {resolved}
        </div>
        <div className="mt-2 text-lg font-medium">
          Issues Resolved
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Issues resolved successfully
        </p>
      </div>

      <div>
        <div className="flex items-center justify-center gap-2 text-4xl font-bold text-primary">
          <TreePine className="h-8 w-8" />
          {trees}
        </div>
        <div className="mt-2 text-lg font-medium">
          Trees Planted
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          As part of drive activities
        </p>
      </div>

      <div>
        <div className="text-4xl font-bold text-primary">
          {resolutionRate}%
        </div>
        <div className="mt-2 text-lg font-medium">
          Resolution Rate
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Issues resolved successfully
        </p>
      </div>
    </div>
    </section>
    
  )
}

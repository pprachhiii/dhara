import { Card, CardContent } from "@/components/ui/card"
import { FileText, Megaphone, Scale, Heart } from "lucide-react"

export function HowItWorksSection() {
  return (
    <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">How DHARA Works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            A systematic approach to civic engagement that ensures issues are
            properly tracked, prioritized, and resolved.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              title: "Report & Validate",
              description:
                "Citizens report issues with photos and location. Moderators validate to prevent duplicates and ensure accuracy.",
              icon: FileText,
            },
            {
              step: "02",
              title: "Authority Contact",
              description:
                "Volunteers contact relevant authorities with documented proof. Auto-escalation if no response within 7 days.",
              icon: Megaphone,
            },
            {
              step: "03",
              title: "Priority Voting",
              description:
                "Eligible issues enter community voting. Priority scoring balances health risk, urgency, and community input.",
              icon: Scale,
            },
            {
              step: "04",
              title: "Drive & Steward",
              description:
                "Community drives address issues. Area stewards ensure long-term maintenance and prevent recurrence.",
              icon: Heart,
            },
          ].map((item) => (
            <Card key={item.step} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-3xl font-bold text-primary/20">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-lg font-semibold">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
    </section>
  )
}

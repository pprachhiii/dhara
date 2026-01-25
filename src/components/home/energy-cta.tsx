import { Card, CardContent } from "@/components/ui/card"
import { Users, Clock, Shield, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "../ui/button"

export function EnergyAwareCTA() {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-primary-foreground">
            Participate at Your Pace
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            DHARA respects your energy. Choose how you want to contribute —
            full participation, micro-tasks, monitoring only, or rest mode.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { mode: "Full", desc: "Join drives & lead initiatives", icon: Users },
              { mode: "Micro-Tasks", desc: "Quick photos & calls", icon: Clock },
              { mode: "Monitoring", desc: "Keep areas clean", icon: Shield },
              { mode: "Rest", desc: "Take a break, no notifications", icon: Heart },
            ].map((item) => (
              <Card
                key={item.mode}
                className="bg-primary-foreground/10 border-primary-foreground/20"
              >
                <CardContent className="p-4 text-center">
                  <item.icon className="mx-auto h-8 w-8 text-primary-foreground/80" />
                  <h3 className="mt-2 font-semibold text-primary-foreground">
                    {item.mode}
                  </h3>
                  <p className="mt-1 text-sm text-primary-foreground/70">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="gap-2">
                Join the Community
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

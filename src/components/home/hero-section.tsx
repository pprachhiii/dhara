// components/home/hero-section.tsx
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Megaphone} from "lucide-react"
import heroImage from "@/../public/hero-community.png"

export function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Community environmental stewardship"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 hero-gradient opacity-85" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold">
            Report Issues.{" "}
            <span className="text-yellow-400">Drive Change.</span>{" "}
            Own Your Neighborhood.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg opacity-90">
            DHARA empowers communities to identify, prioritize, and resolve
            civic issues through transparent tracking and volunteer action.
          </p>

          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Button asChild size="lg" className="hover:scale-110">
              <Link href="/reports/new">
                <Megaphone className="mr-2 h-5 w-5" />
                Report Issue
              </Link>
            </Button>

            <Button asChild size="lg" className="bg-green-600 text-white hover:bg-green-600 hover:scale-110">
              <Link href="/reports">
                <FileText className="mr-2 h-5 w-5" />
                Browse Reports
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

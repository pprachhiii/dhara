import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Brand */}
        <p className="text-sm font-semibold">DHARA</p>

        {/* Links */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/reports" className="hover:text-foreground">
            Reports
          </Link>
          <Link href="/drives" className="hover:text-foreground">
            Drives
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-sm text-muted-foreground">
          © 2025 DHARA
        </p>
      </div>
    </footer>
  )
}

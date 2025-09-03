"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Dhara
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-6 items-center">
          <Link
            href="/"
            className={`hover:text-blue-600 transition ${
              pathname === "/" ? "font-semibold text-blue-600" : "text-gray-700"
            }`}
          >
            Home
          </Link>
          <Link
            href="/report"
            className={`hover:text-blue-600 transition ${
              pathname === "/report" ? "font-semibold text-blue-600" : "text-gray-700"
            }`}
          >
            Reports
          </Link>
          <Link
            href="/about"
            className={`hover:text-blue-600 transition ${
              pathname === "/about" ? "font-semibold text-blue-600" : "text-gray-700"
            }`}
          >
            About
          </Link>
        </div>

        {/* Action buttons: only Report & Authority */}
        <div className="hidden md:flex gap-2">
          <Button asChild>
            <Link href="/form?model=Report">+ New Report</Link>
          </Button>
          <Button asChild>
            <Link href="/form?model=Authority">+ New Authority</Link>
          </Button>
        </div>

        {/* Mobile Hamburger placeholder */}
        <div className="md:hidden"></div>
      </div>
    </nav>
  );
}

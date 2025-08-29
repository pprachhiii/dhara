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
          🌍 Dhara
        </Link>

        {/* Links */}
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

        {/* Action button */}
        <div className="hidden md:flex">
          <Button asChild>
            <Link href="/report">+ New Report</Link>
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
        </div>
      </div>
    </nav>
  );
}

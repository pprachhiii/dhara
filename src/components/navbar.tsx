"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
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
                pathname === "/"
                  ? "font-semibold text-blue-600"
                  : "text-gray-700"
              }`}
            >
              Home
            </Link>
            <Link
              href="/report"
              className={`hover:text-blue-600 transition ${
                pathname === "/report"
                  ? "font-semibold text-blue-600"
                  : "text-gray-700"
              }`}
            >
              Reports
            </Link>
          </div>

          {/* Action buttons: only Report & Authority */}
          <div className="hidden md:flex gap-2 items-center">
            <Button asChild>
              <Link href="/form?model=Report">+ New Report</Link>
            </Button>
            <Button asChild>
              <Link href="/form?model=Authority">+ New Authority</Link>
            </Button>
            <Button onClick={() => setIsFeedbackOpen(true)}>Feedback</Button>
          </div>

          {/* Mobile Hamburger placeholder */}
          <div className="md:hidden"></div>
        </div>
      </nav>

      {/* Feedback Overlay */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 flex justify-end z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsFeedbackOpen(false)}
          ></div>
          <div className="relative bg-white w-96 h-full shadow-xl p-6 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Give Feedback</h2>
            <form className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Your Name"
                className="border rounded-lg p-2"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="border rounded-lg p-2"
              />
              <textarea
                placeholder="Your Feedback"
                className="border rounded-lg p-2 h-32"
              ></textarea>
              <Button type="submit">Submit</Button>
            </form>
            <Button
              variant="ghost"
              className="absolute top-4 right-4"
              onClick={() => setIsFeedbackOpen(false)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

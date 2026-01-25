"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Users, FileText, BarChart3 } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setIsLoggedIn(false);
      router.push("/auth/login");
    } catch {
      console.error("Logout failed");
    }
  };

  const navItems = [
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/drives", label: "Drives", icon: Users},
    { href: "/voting", label: "Voting Hub", icon: BarChart3 },

  ];

  return (
    <>
      <nav className="w-full bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-green-800">
            DHARA
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-6 items-center">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 transition ${
                    isActive
                      ? "font-semibold text-green-800"
                      : "text-gray-700 hover:text-green-800"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-green-800" : "text-gray-500"}
                  />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Auth & Feedback */}
          <div className="hidden md:flex gap-2 items-center">
            {!isLoggedIn ? (
              <>
                <Button asChild className="bg-yellow-500 hover:bg-yellow-600 hover:scale-105">
                  <Link href="/auth/login">Login</Link>
                </Button>
              </>
            ) : (
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            )}
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

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, BarChart3, HardDrive } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Check login status on mount + whenever path changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  // ✅ Also listen to storage changes (multi-tab sync)
  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/auth/login"); // ✅ redirect to login page, not API
  };

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/report", label: "Reports", icon: BarChart3 },
    { href: "/drives", label: "Drives", icon: HardDrive },
  ];

  return (
    <>
      <nav className="w-full bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
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
                      ? "font-semibold text-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-blue-600" : "text-gray-500"}
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
                {/* ✅ Link to PAGES not API */}
                <Button asChild variant="outline">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Signup</Link>
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

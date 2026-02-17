'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Users, FileText, Menu, X } from 'lucide-react';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, LayoutDashboard, MessageSquare } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    router.push('/auth/login');
  };

  const navItems = [
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/drives', label: 'Drives', icon: Users },
  ];

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className='sticky top-0 z-40 w-full bg-white shadow-md'>
        <div className='max-w-7xl mx-auto px-6 py-4 flex items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='text-2xl font-bold text-green-800'>
            Dhara
          </Link>

          {/* Desktop Nav */}
          <div className='hidden md:flex gap-2 items-center'>
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md
                    ${isActive ? 'bg-gray-100' : 'hover:bg-gray-100'}
                    text-gray-800
                  `}
                >
                  <Icon size={18} className='text-gray-600' />
                  <span className='text-sm font-medium'>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Buttons */}
          <div className='hidden md:flex gap-2 items-center'>
            {!isLoggedIn ? (
              <>
                <Button asChild variant='yellow'>
                  <Link href='/auth/login'>Login</Link>
                </Button>

                <Button variant='white' onClick={() => setIsFeedbackOpen(true)}>
                  Feedback
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300'>
                    <User className='h-5 w-5 text-gray-700' />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className='mr-2 h-4 w-4' />
                    Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setIsFeedbackOpen(true)}>
                    <MessageSquare className='mr-2 h-4 w-4' />
                    Feedback
                  </DropdownMenuItem>

                  <DropdownMenuItem className='text-red-600' onClick={handleLogout}>
                    <LogOut className='mr-2 h-4 w-4' />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className='md:hidden p-2 rounded-md hover:bg-gray-100'
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className='h-6 w-6 text-gray-800' />
          </button>
        </div>
      </nav>

      {/* ================= MOBILE SIDEBAR ================= */}
      {isMobileMenuOpen && (
        <div className='fixed inset-0 z-50'>
          {/* Overlay */}
          <div
            className='absolute inset-0 bg-black/40'
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className='absolute right-0 top-0 h-full w-72 bg-white shadow-xl p-6 flex flex-col gap-4'>
            {/* Close */}
            <div className='flex justify-end'>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className='p-2 rounded-md hover:bg-gray-100'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Nav Items */}
            <div className='flex flex-col gap-2'>
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-md
                      ${isActive ? 'bg-gray-100' : 'hover:bg-gray-100'}
                      text-gray-800
                    `}
                  >
                    <Icon size={18} className='text-gray-600' />
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className='border-t my-2' />

            {/* Auth Buttons */}
            <div className='flex flex-col gap-3'>
              {!isLoggedIn ? (
                <>
                  <Button
                    variant='yellow'
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/auth/login');
                    }}
                  >
                    Login
                  </Button>

                  <Button
                    variant='white'
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsFeedbackOpen(true);
                    }}
                  >
                    Feedback
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/dashboard');
                    }}
                  >
                    Dashboard
                  </Button>

                  <Button
                    variant='white'
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsFeedbackOpen(true);
                    }}
                  >
                    Feedback
                  </Button>

                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    Sign out
                  </Button>
                </>
              )}

              <Button
                variant='white'
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsFeedbackOpen(true);
                }}
              >
                Feedback
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FEEDBACK DRAWER ================= */}
      {isFeedbackOpen && (
        <div className='fixed inset-0 flex justify-end z-50'>
          <div className='absolute inset-0 bg-black/40' onClick={() => setIsFeedbackOpen(false)} />

          <div className='relative bg-white w-96 h-full shadow-2xl p-8 overflow-y-auto border-l border-gray-100'>
            {/* Header */}
            <div className='mb-6'>
              <h2 className='text-2xl font-bold text-gray-900'>Share your feedback</h2>
              <p className='text-sm text-gray-600 mt-1'>Help us improve Dhara for your community</p>
            </div>

            {/* Form */}
            <form className='flex flex-col gap-4'>
              <div className='space-y-1'>
                <label className='text-sm font-medium text-gray-700'>Your name</label>
                <Input placeholder='Enter your name' />
              </div>

              <div className='space-y-1'>
                <label className='text-sm font-medium text-gray-700'>Email address</label>
                <Input type='email' placeholder='you@example.com' />
              </div>

              <div className='space-y-1'>
                <label className='text-sm font-medium text-gray-700'>Feedback</label>
                <textarea
                  className='
          w-full rounded-md border border-input bg-background
          px-3 py-2 text-sm resize-none h-32
          placeholder:text-muted-foreground
          focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-yellow-400
          focus-visible:border-yellow-400
        '
                  placeholder="Tell us what’s working, what’s not, or what you'd like to see…"
                />
              </div>

              <Button type='submit' className='mt-2'>
                Submit feedback
              </Button>
            </form>

            <button
              onClick={() => setIsFeedbackOpen(false)}
              className='absolute top-5 right-5 text-red-500 text-lg font-semibold hover:text-red-600'
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

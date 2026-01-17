'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-playful group-hover:scale-105 transition-transform">
              <span className="text-white text-xl">📚</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                Lenny&apos;s Books
              </span>
              <span className="text-[10px] text-gray-400 -mt-0.5 hidden sm:block">
                Powered by Lenny Podcast
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`font-medium transition-colors ${
                isActive('/') && pathname === '/'
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Home
            </Link>
            <Link
              href="/discover"
              className={`font-medium transition-colors ${
                isActive('/discover')
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Discover Episodes
            </Link>
            <Link
              href="/create"
              className={`font-medium transition-colors ${
                isActive('/create')
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Create Book
            </Link>
            <Link
              href="/admin"
              className={`font-medium transition-colors ${
                isActive('/admin')
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Admin
            </Link>
          </nav>

          {/* CTA */}
          <Link
            href="/discover"
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors shadow-playful hover:shadow-playful-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

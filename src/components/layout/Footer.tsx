'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📚</span>
              </div>
              <span className="font-display text-lg font-bold text-gray-900">
                Lenny&apos;s Books
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Transform podcast conversations into magical personalized
              children&apos;s books. Powered by AI, crafted with love.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/create"
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  Create a Book
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Made With</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>❤️</span>
              <span>for families everywhere</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Lenny&apos;s Children&apos;s Book
            Generator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[var(--ps-red-dark)] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-icon.jpg"
              alt="Project Sauce"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-xl font-bold tracking-tight text-[var(--ps-orange)]">
              Project Sauce
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/stores"
              className="hover:text-[var(--ps-orange)] transition-colors"
            >
              Store Map
            </Link>
            <Link
              href="/deals"
              className="hover:text-[var(--ps-orange)] transition-colors"
            >
              Deals
            </Link>
            <Link
              href="/recipe"
              className="hover:text-[var(--ps-orange)] transition-colors"
            >
              Recipe of the Week
            </Link>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-white/10">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/stores"
              className="block py-2 hover:text-[var(--ps-orange)]"
              onClick={() => setIsOpen(false)}
            >
              Store Map
            </Link>
            <Link
              href="/deals"
              className="block py-2 hover:text-[var(--ps-orange)]"
              onClick={() => setIsOpen(false)}
            >
              Deals
            </Link>
            <Link
              href="/recipe"
              className="block py-2 hover:text-[var(--ps-orange)]"
              onClick={() => setIsOpen(false)}
            >
              Recipe of the Week
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

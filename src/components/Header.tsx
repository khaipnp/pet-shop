"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [cartCount] = useState(3);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-card/95 backdrop-blur-sm">
      <div className="container-page flex h-16 items-center justify-between">
        {/* ── Logo ──────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-bold text-primary-dark transition-colors hover:text-primary"
        >
          <span className="text-2xl">🐾</span>
          <span className="hidden sm:inline">Scrumbles</span>
        </Link>

        {/* ── Desktop Nav ─────────────────────────── */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-display text-base font-semibold text-gray-600 transition-colors hover:text-primary-dark"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Actions ─────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button
            aria-label="Search"
            className="flex size-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-muted hover:text-primary-dark"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex size-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-muted hover:text-primary-dark"
            aria-label={`Cart with ${cartCount} items`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold leading-none text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {/* Login / My Account */}
          <Link
            href="/account"
            className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-display text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark sm:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            Account
          </Link>

          {/* Mobile hamburger */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex size-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-muted hover:text-primary-dark md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile Nav ──────────────────────────── */}
      {mobileOpen && (
        <nav className="border-t border-border bg-card px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2 font-display text-base font-semibold text-gray-600 transition-colors hover:bg-muted hover:text-primary-dark"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              My Account
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

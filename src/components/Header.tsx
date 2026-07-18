"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [cartCount] = useState(3);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-card/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 bg-primary">
        {/* ── Logo ──────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-bold text-primary-foreground transition-colors hover:text-primary"
        >
          <span className="text-2xl">🐾</span>
          <span className="hidden sm:inline">Scrumbles</span>
        </Link>

        {/* ── Actions ─────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <Input placeholder="Search" />

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex size-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-muted hover:text-primary-dark"
            aria-label={`Cart with ${cartCount} items`}
          >
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
            Account
          </Link>

          {/* Mobile hamburger */}
          <Button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex size-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-muted hover:text-primary-dark md:hidden"
          >
            =
          </Button>
        </div>
      </div>

      {/* ── Mobile Nav ──────────────────────────── */}
      {mobileOpen && (
        <nav className="border-t border-border bg-card px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              My Account
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'

const SIDEBAR_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Products', icon: '🛍️' },
  { href: '/admin/categories', label: 'Categories', icon: '📂' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar ──────────────────────────── */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r-2 border-border bg-card">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b-2 border-border px-5">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-display text-lg font-bold text-primary-dark"
          >
            <span className="text-2xl">🐾</span>
            <span>Scrumbles</span>
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">
              Admin
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 p-3">
          {SIDEBAR_LINKS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 font-display text-sm font-semibold text-gray-600 transition-all hover:bg-muted hover:text-primary-dark"
            >
              <span className="text-lg">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom user info */}
        <div className="border-t-2 border-border p-4">
          <Link
            href="/"
            className="mb-2 flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-primary-dark"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Back to site
          </Link>
        </div>
      </aside>

      {/* ── Main content ─────────────────────── */}
      <div className="ml-64 flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b-2 border-border bg-card px-6">
          <div>
            <p className="font-display text-sm font-semibold text-gray-600">
              Welcome back, <span className="text-primary-dark">{user.name}</span>
            </p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Admin avatar */}
            <div className="flex size-9 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-white">
              {initials}
            </div>

            {/* Logout form */}
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-full border-2 border-border px-4 py-1.5 font-display text-sm font-semibold text-gray-500 transition-all hover:border-primary hover:text-primary-dark"
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

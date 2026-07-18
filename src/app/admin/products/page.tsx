import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { formatPrice, formatNumber } from '@/lib/utils'
import { ProductsTable } from './products-table'

interface Props {
  searchParams: Promise<{ search?: string; page?: string }>
}

const ITEMS_PER_PAGE = 20

export default async function AdminProductsPage(props: Props) {
  const user = await getAuthUser()
  if (!user || user.role !== 'ADMIN') redirect('/auth/login')

  const searchParams = await props.searchParams
  const search = searchParams.search || ''
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1)

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: { category: { select: { name: true } } },
    }),
    prisma.product.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-gray-500">{formatNumber(totalCount)} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 font-display text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Product
        </Link>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/products" className="flex gap-3">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search products by name or slug..."
          className="w-full max-w-md rounded-xl border-2 border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-gray-400 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="rounded-xl bg-primary px-5 py-2.5 font-display text-sm font-semibold text-white transition-all hover:bg-primary-dark"
        >
          Search
        </button>
        {search && (
          <Link
            href="/admin/products"
            className="flex items-center rounded-xl px-4 py-2.5 font-display text-sm font-semibold text-gray-500 transition-all hover:bg-muted"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <ProductsTable products={products} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/products?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
              className="rounded-xl border-2 border-border px-4 py-2 font-display text-sm font-semibold text-gray-600 transition-all hover:bg-muted"
            >
              ← Previous
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center gap-1">
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="px-1 text-gray-400">…</span>
                )}
                {p === page ? (
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-white">
                    {p}
                  </span>
                ) : (
                  <Link
                    href={`/admin/products?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                    className="flex size-9 items-center justify-center rounded-xl font-display text-sm font-semibold text-gray-600 transition-all hover:bg-muted"
                  >
                    {p}
                  </Link>
                )}
              </span>
            ))}

          {page < totalPages && (
            <Link
              href={`/admin/products?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
              className="rounded-xl border-2 border-border px-4 py-2 font-display text-sm font-semibold text-gray-600 transition-all hover:bg-muted"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

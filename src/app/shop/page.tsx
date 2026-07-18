import { Suspense } from 'react'
import Link from 'next/link'
import type { ProductStatus } from '@prisma/client'
import prisma from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import SortSelect from './SortSelect'

// ─── Types ──────────────────────────────────────────────

interface ShopSearchParams {
  category?: string
  petType?: string
  sort?: string
  minPrice?: string
  maxPrice?: string
}

// ─── Server Component ──────────────────────────────────

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>
}) {
  const params = await searchParams
  const { category, petType, sort, minPrice, maxPrice } = params

  // ── Build filter ──
  const where: Record<string, unknown> = { status: 'ACTIVE' as ProductStatus }

  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: category } })
    if (cat) where.categoryId = cat.id
  }

  if (petType && (petType === 'dog' || petType === 'cat')) {
    where.petType = { in: [petType, 'both'] }
  }

  if (minPrice || maxPrice) {
    const priceFilter: Record<string, number> = {}
    if (minPrice) priceFilter.gte = Number(minPrice)
    if (maxPrice) priceFilter.lte = Number(maxPrice)
    where.price = priceFilter
  }

  // ── Sort ──
  type SortOption = { [key: string]: 'asc' | 'desc' }
  let orderBy: SortOption[] = [{ createdAt: 'desc' as const }]
  if (sort === 'price_asc') orderBy = [{ price: 'asc' }]
  else if (sort === 'price_desc') orderBy = [{ price: 'desc' }]
  else if (sort === 'name_asc') orderBy = [{ name: 'asc' }]
  else if (sort === 'sales') orderBy = [{ salesCount: 'desc' }]

  // ── Fetch ──
  const [products, categories, total] = await Promise.all([
    prisma.product.findMany({
      where: where as any,
      orderBy,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.count({ where: where as any }),
  ])

  return (
    <div className="container-page py-8">
      <h1 className="mb-8 font-display text-3xl font-bold text-foreground">
        🛍️ All Products
        <span className="ml-2 text-base font-normal text-gray-400">
          ({total} sản phẩm)
        </span>
      </h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* ── Sidebar Filters ──────────────────────────── */}
        <aside className="w-full shrink-0 lg:w-64">
          <Card className="sticky top-24">
            <CardContent>
              <h3 className="mb-4 font-display text-lg font-bold">Bộ lọc</h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="mb-2 text-sm font-semibold text-gray-600">
                  Danh mục
                </h4>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/shop"
                      className={`block rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted ${
                        !category ? 'bg-primary/10 font-semibold text-primary-dark' : 'text-gray-600'
                      }`}
                    >
                      Tất cả
                    </Link>
                  </li>
                  {categories.map((c) => {
                    const href = c.slug === category ? '/shop' : `/shop?category=${c.slug}`
                    return (
                      <li key={c.id}>
                        <Link
                          href={href}
                          className={`block rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted ${
                            c.slug === category
                              ? 'bg-primary/10 font-semibold text-primary-dark'
                              : 'text-gray-600'
                          }`}
                        >
                          {c.icon ?? '•'} {c.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Pet Type */}
              <div className="mb-6">
                <h4 className="mb-2 text-sm font-semibold text-gray-600">
                  Loại thú cưng
                </h4>
                <div className="flex gap-2">
                  {[
                    { value: '', label: 'Tất cả' },
                    { value: 'dog', label: '🐕 Chó' },
                    { value: 'cat', label: '🐈 Mèo' },
                  ].map((pt) => {
                    const href = !pt.value
                      ? `/shop${category ? `?category=${category}` : ''}`
                      : `/shop?petType=${pt.value}${category ? `&category=${category}` : ''}`
                    return (
                      <Link
                        key={pt.value}
                        href={href}
                        className={`rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted ${
                          (petType ?? '') === pt.value
                            ? 'bg-accent/20 font-semibold text-accent-dark'
                            : 'text-gray-600'
                        }`}
                      >
                        {pt.label}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Price Range (basic) */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-600">
                  Khoảng giá
                </h4>
                <div className="flex gap-2">
                  {[
                    { label: 'Dưới 100k', min: '0', max: '100000' },
                    { label: '100k–500k', min: '100000', max: '500000' },
                    { label: 'Trên 500k', min: '500000', max: '' },
                  ].map((r) => {
                    const params = new URLSearchParams()
                    if (category) params.set('category', category)
                    if (petType) params.set('petType', petType)
                    if (r.min) params.set('minPrice', r.min)
                    if (r.max) params.set('maxPrice', r.max)
                    const href = `/shop?${params.toString()}`
                    const active =
                      (minPrice ?? '') === r.min && (maxPrice ?? '') === r.max
                    return (
                      <Link
                        key={r.label}
                        href={href}
                        className={`rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-muted ${
                          active
                            ? 'bg-primary/10 font-semibold text-primary-dark'
                            : 'text-gray-600'
                        }`}
                      >
                        {r.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* ── Products Grid ────────────────────────────── */}
        <div className="flex-1">
          {/* Sort */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">{total} kết quả</p>
            <SortSelect currentSort={sort ?? ''} />
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl">🔍</span>
              <p className="mt-4 font-display text-lg font-semibold text-gray-600">
                Không tìm thấy sản phẩm
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <Link key={product.id} href={`/shop/${product.slug}`}>
                  <Card className="group h-full cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg">
                    <div className="aspect-square w-full rounded-t-2xl bg-gradient-to-br from-primary/20 to-accent/20" />
                    <CardContent>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary-dark">
                        {product.category?.name ?? 'Đa năng'}
                      </p>
                      <CardTitle className="line-clamp-2 text-base">
                        {product.name}
                      </CardTitle>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-display text-lg font-bold text-primary-dark">
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAt &&
                          Number(product.compareAt) > Number(product.price) && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(product.compareAt)}
                            </span>
                          )}
                      </div>
                      {product.stock <= 5 && product.stock > 0 && (
                        <p className="mt-1 text-xs font-medium text-amber-600">
                          Chỉ còn {product.stock} sản phẩm
                        </p>
                      )}
                      {product.stock === 0 && (
                        <p className="mt-1 text-xs font-medium text-red-500">
                          Hết hàng
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

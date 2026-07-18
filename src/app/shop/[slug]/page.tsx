import Link from 'next/link'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import AddToCartButton from './AddToCartButton'

// ─── Server Component ──────────────────────────────────

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: { select: { name: true, slug: true } } },
  })

  if (!product || product.status !== 'ACTIVE') {
    notFound()
  }

  const hasDiscount =
    product.compareAt && Number(product.compareAt) > Number(product.price)
  const discountPercent = hasDiscount
    ? Math.round(
        (1 - Number(product.price) / Number(product.compareAt)) * 100,
      )
    : 0

  return (
    <div className="container-page py-8">
      {/* ── Breadcrumb ──────────────────────────────── */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-primary-dark transition-colors">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <Link
          href="/shop"
          className="hover:text-primary-dark transition-colors"
        >
          Sản phẩm
        </Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="hover:text-primary-dark transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* ── Image Gallery ────────────────────────────── */}
        <div className="w-full lg:w-1/2">
          <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 shadow-md" />
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {product.images.map((_, i) => (
                <div
                  key={i}
                  className="size-20 shrink-0 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15"
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ─────────────────────────────── */}
        <div className="flex w-full flex-col gap-6 lg:w-1/2">
          {/* Category tag */}
          {product.category && (
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary/30 px-3 py-1 font-display text-xs font-semibold text-gray-700 transition-colors hover:bg-secondary/50"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-primary-dark">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.compareAt)}
                </span>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 font-display text-xs font-bold text-red-500">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Stock status */}
          <div>
            {product.stock > 5 ? (
              <p className="flex items-center gap-1 text-sm font-medium text-green-600">
                <span className="inline-block size-2 rounded-full bg-green-500" />
                Còn hàng ({product.stock} sản phẩm)
              </p>
            ) : product.stock > 0 ? (
              <p className="flex items-center gap-1 text-sm font-medium text-amber-600">
                <span className="inline-block size-2 rounded-full bg-amber-500" />
                Sắp hết — chỉ còn {product.stock} sản phẩm
              </p>
            ) : (
              <p className="flex items-center gap-1 text-sm font-medium text-red-500">
                <span className="inline-block size-2 rounded-full bg-red-500" />
                Hết hàng
              </p>
            )}
          </div>

          {/* Description */}
          <Card className="gap-0 bg-muted/50 py-0">
            <CardContent className="py-4">
              <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-gray-600">
                Mô tả sản phẩm
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                {product.description}
              </p>
            </CardContent>
          </Card>

          {/* Pet type tag */}
          {product.petType && (
            <p className="text-sm text-gray-500">
              🎯 Phù hợp với:{' '}
              <span className="font-semibold text-foreground">
                {product.petType === 'dog'
                  ? '🐕 Chó'
                  : product.petType === 'cat'
                    ? '🐈 Mèo'
                    : '🐕🐈 Chó & Mèo'}
              </span>
            </p>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent/15 px-3 py-1 font-display text-xs font-medium text-accent-dark"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Add to cart */}
          <div className="mt-2 flex items-center gap-4">
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              productPrice={Number(product.price)}
              stock={product.stock}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

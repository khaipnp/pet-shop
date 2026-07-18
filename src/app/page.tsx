import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import prisma from '@/lib/prisma'

// ─── Data ──────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Thức ăn cho chó', slug: 'thuc-an-cho-cho', icon: '🐕', desc: 'Thức ăn dinh dưỡng cho chó' },
  { name: 'Thức ăn cho mèo', slug: 'thuc-an-cho-meo', icon: '🐈', desc: 'Thức ăn ngon cho mèo yêu' },
  { name: 'Đồ chơi thú cưng', slug: 'do-choi', icon: '🎾', desc: 'Đồ chơi vui nhộn mỗi ngày' },
  { name: 'Phụ kiện & Vòng cổ', slug: 'phu-kien', icon: '🦴', desc: 'Phụ kiện thời trang cho pet' },
  { name: 'Vệ sinh & Chăm sóc', slug: 've-sinh', icon: '🧴', desc: 'Dụng cụ vệ sinh thú cưng' },
  { name: 'Quần áo thú cưng', slug: 'quan-ao', icon: '👕', desc: 'Thời trang cho chó mèo' },
  { name: 'Sữa tắm & Dưỡng lông', slug: 'sua-tam-duong-long', icon: '🧼', desc: 'Chăm sóc lông mềm mượt' },
]

const REVIEWS = [
  { name: 'Minh Anh', avatar: 'MA', rating: 5, text: 'Sản phẩm chất lượng, đóng gói cẩn thận. Bé mèo nhà mình rất thích!' },
  { name: 'Hoàng Nam', avatar: 'HN', rating: 5, text: 'Giao hàng nhanh, giá tốt. Sẽ ủng hộ shop dài dài.' },
  { name: 'Thu Trang', avatar: 'TT', rating: 4, text: 'Lần đầu mua, chất lượng vượt mong đợi. Bé cún rất thích món đồ chơi.' },
]

// ─── Server Component ──────────────────────────────────

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { featured: true, status: 'ACTIVE' },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { name: true, slug: true } } },
  })

  return (
    <>
      {/* ── Hero Section ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 px-4 py-20 sm:py-28">
        <div className="container-page relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Pawsitively Perfect{' '}
              <span className="text-primary-dark">Pet Supplies</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl">
              Tất cả những gì bạn cần cho người bạn nhỏ — từ thức ăn dinh dưỡng,
              đồ chơi vui nhộn đến phụ kiện đáng yêu. Yêu thương qua từng sản phẩm!
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/shop">
                <Button size="lg" variant="primary">
                  🛒 Shop Now
                </Button>
              </Link>
              <Link href="#categories">
                <Button size="lg" variant="outline">
                  📖 Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 size-64 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* ── Featured Products ──────────────────────────── */}
      <section className="container-page py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            🌟 Sản phẩm nổi bật
          </h2>
          <Link
            href="/shop"
            className="font-display text-sm font-semibold text-primary-dark transition-colors hover:text-primary"
          >
            Xem tất cả →
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <p className="text-gray-500">Chưa có sản phẩm nổi bật.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
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
                      {product.compareAt && Number(product.compareAt) > Number(product.price) && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.compareAt)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Category Showcase ─────────────────────────── */}
      <section id="categories" className="bg-muted py-16">
        <div className="container-page">
          <h2 className="mb-2 text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
            🗂️ Danh mục sản phẩm
          </h2>
          <p className="mb-10 text-center text-gray-500">
            Khám phá sản phẩm theo danh mục yêu thích
          </p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`}>
                <Card className="group cursor-pointer text-center transition-all hover:-translate-y-1 hover:shadow-lg">
                  <CardContent>
                    <div className="mb-2 text-3xl transition-transform group-hover:scale-110">
                      {cat.icon}
                    </div>
                    <CardTitle className="text-sm">{cat.name}</CardTitle>
                    <p className="mt-1 text-xs text-gray-400">{cat.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────── */}
      <section className="container-page py-16">
        <h2 className="mb-2 text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
          ⭐ Khách hàng nói gì
        </h2>
        <p className="mb-10 text-center text-gray-500">
          Hàng ngàn khách hàng đã tin tưởng Scrumbles
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Card key={i} className="text-center">
              <CardContent>
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/20 font-display text-sm font-bold text-primary-dark">
                  {r.avatar}
                </div>
                <div className="mb-2 flex justify-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className="text-sm">
                      {j < r.rating ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                <p className="text-sm italic leading-relaxed text-gray-600">
                  &ldquo;{r.text}&rdquo;
                </p>
                <p className="mt-3 font-display text-sm font-semibold text-foreground">
                  — {r.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 py-16">
        <div className="container-page mx-auto max-w-xl text-center">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            📬 Nhận tin khuyến mãi
          </h2>
          <p className="mt-3 text-gray-600">
            Đăng ký để nhận ưu đãi đặc biệt và sản phẩm mới mỗi tuần!
          </p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              placeholder="Nhập email của bạn..."
              className="flex-1"
              required
            />
            <Button type="submit" variant="primary" size="lg">
              Đăng ký
            </Button>
          </form>
        </div>
      </section>
    </>
  )
}

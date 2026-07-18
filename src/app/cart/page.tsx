import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import CartItemRow from './CartItemRow'

// ─── Server Component ──────────────────────────────────

export default async function CartPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    // Not logged in — show empty cart with login prompt
    return <EmptyCart loggedIn={false} />
  }

  const payload = verifyToken(token)
  if (!payload) {
    return <EmptyCart loggedIn={false} />
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: payload.userId },
    include: {
      items: {
        include: { product: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!cart || cart.items.length === 0) {
    return <EmptyCart loggedIn={true} />
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  )
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="container-page py-8">
      <h1 className="mb-8 font-display text-3xl font-bold text-foreground">
        🛒 Giỏ hàng
        <span className="ml-2 text-base font-normal text-gray-400">
          ({itemCount} sản phẩm)
        </span>
      </h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* ── Cart Items ────────────────────────────── */}
        <div className="flex-1 space-y-4">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={{
                id: item.id,
                productId: item.productId,
                name: item.product.name,
                slug: item.product.slug,
                price: Number(item.product.price),
                compareAt: item.product.compareAt
                  ? Number(item.product.compareAt)
                  : null,
                quantity: item.quantity,
                stock: item.product.stock,
              }}
            />
          ))}
        </div>

        {/* ── Order Summary ────────────────────────────── */}
        <div className="w-full shrink-0 lg:w-80">
          <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-display text-lg font-bold text-foreground">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({itemCount} sản phẩm)</span>
                <span className="font-medium text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-foreground">
                  Tính khi thanh toán
                </span>
              </div>
            </div>

            <div className="my-4 border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="font-display text-base font-bold text-foreground">
                  Tổng cộng
                </span>
                <span className="font-display text-xl font-bold text-primary-dark">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className={buttonVariants({ size: 'lg', className: 'w-full' })}
            >
              🛍️ Thanh toán
            </Link>

            <div className="mt-3 text-center">
              <Link
                href="/shop"
                className="text-sm font-medium text-gray-500 transition-colors hover:text-primary-dark"
              >
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Empty Cart ──────────────────────────────────────

function EmptyCart({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="container-page flex flex-col items-center justify-center py-20 text-center">
      <span className="text-6xl">🛒</span>
      <h1 className="mt-6 font-display text-2xl font-bold text-foreground">
        Giỏ hàng trống
      </h1>
      <p className="mt-2 text-gray-500">
        {loggedIn
          ? 'Bạn chưa thêm sản phẩm nào vào giỏ hàng.'
          : 'Vui lòng đăng nhập để xem giỏ hàng của bạn.'}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/shop" className={buttonVariants({ size: 'lg' })}>
          🛍️ Mua sắm ngay
        </Link>
        {!loggedIn && (
          <Link
            href="/auth/login"
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            🔑 Đăng nhập
          </Link>
        )}
      </div>
    </div>
  )
}

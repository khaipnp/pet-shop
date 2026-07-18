import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import CheckoutForm from './CheckoutForm'

// ─── Server Component ──────────────────────────────────

export default async function CheckoutPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    redirect('/auth/login?redirect=/checkout')
  }

  const payload = verifyToken(token)
  if (!payload) {
    redirect('/auth/login?redirect=/checkout')
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: payload.userId },
    include: {
      items: {
        include: { product: true },
        orderBy: { createdAt: 'asc' },
      },
      user: {
        select: { name: true, phone: true },
      },
    },
  })

  if (!cart || cart.items.length === 0) {
    redirect('/cart')
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  )
  const shippingFee = subtotal >= 500000 ? 0 : 30000
  const total = subtotal + shippingFee

  const cartItems = cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    price: Number(item.product.price),
    quantity: item.quantity,
    image: item.product.images[0] ?? null,
  }))

  return (
    <div className="container-page py-8">
      <h1 className="mb-8 font-display text-3xl font-bold text-foreground">
        📋 Thanh toán
      </h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* ── Form ───────────────────────────────────── */}
        <div className="flex-1">
          <CheckoutForm
            items={cartItems}
            subtotal={subtotal}
            shippingFee={shippingFee}
            total={total}
            defaultName={cart.user.name}
            defaultPhone={cart.user.phone ?? ''}
          />
        </div>

        {/* ── Order Summary ────────────────────────────── */}
        <div className="w-full shrink-0 lg:w-80">
          <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-display text-lg font-bold text-foreground">
              Đơn hàng của bạn
            </h2>

            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="size-12 shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      x{item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span className="font-medium text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-foreground">
                  {shippingFee === 0 ? '🚚 Miễn phí' : formatPrice(shippingFee)}
                </span>
              </div>
              {subtotal < 500000 && (
                <p className="text-xs text-gray-400">
                  Miễn phí vận chuyển cho đơn hàng từ 500.000₫
                </p>
              )}
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="font-display text-base font-bold text-foreground">
                  Tổng cộng
                </span>
                <span className="font-display text-xl font-bold text-primary-dark">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

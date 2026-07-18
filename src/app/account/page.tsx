import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import LogoutButton from './LogoutButton'

// ─── Server Component ──────────────────────────────────

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const params = await searchParams
  const user = await getAuthUser()

  if (!user) {
    redirect('/auth/login?redirect=/account')
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  const justPlacedOrderCode = params.order

  return (
    <div className="container-page py-8">
      <h1 className="mb-8 font-display text-3xl font-bold text-foreground">
        👤 Tài khoản của tôi
      </h1>

      {/* Order placed success banner */}
      {justPlacedOrderCode && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-secondary/30 to-accent/30 p-6 text-center shadow-sm">
          <span className="text-3xl">🎉</span>
          <h2 className="mt-2 font-display text-xl font-bold text-foreground">
            Đặt hàng thành công!
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Mã đơn hàng của bạn:{' '}
            <span className="font-bold text-primary-dark">
              {justPlacedOrderCode}
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* ── User Info ──────────────────────────────── */}
        <div className="w-full shrink-0 lg:w-80">
          <Card>
            <CardContent>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/20 font-display text-xl font-bold text-primary-dark">
                  {user.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'U'}
                </div>
                <div>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-foreground">
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số điện thoại</span>
                  <span className="font-medium text-foreground">
                    {user.phone || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vai trò</span>
                  <span className="font-medium text-foreground">
                    {user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <LogoutButton />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Order History ────────────────────────────── */}
        <div className="flex-1">
          <h2 className="mb-6 font-display text-2xl font-bold text-foreground">
            📦 Lịch sử đơn hàng
          </h2>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <span className="text-4xl">📭</span>
                <p className="mt-4 font-display text-lg font-semibold text-gray-600">
                  Chưa có đơn hàng nào
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Bắt đầu mua sắm để xem lịch sử đơn hàng tại đây
                </p>
                <Link href="/shop" className="mt-4 inline-block">
                  <Button variant="primary">🛍️ Mua sắm ngay</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-display text-base font-bold text-foreground">
                          {order.orderCode}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display text-lg font-bold text-primary-dark">
                          {formatPrice(Number(order.total))}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            order.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700'
                              : order.status === 'CONFIRMED'
                                ? 'bg-blue-100 text-blue-700'
                                : order.status === 'SHIPPING'
                                  ? 'bg-purple-100 text-purple-700'
                                  : order.status === 'DELIVERED'
                                    ? 'bg-green-100 text-green-700'
                                    : order.status === 'CANCELLED'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.status === 'PENDING'
                            ? 'Chờ xác nhận'
                            : order.status === 'CONFIRMED'
                              ? 'Đã xác nhận'
                              : order.status === 'PROCESSING'
                                ? 'Đang xử lý'
                                : order.status === 'SHIPPING'
                                  ? 'Đang giao'
                                  : order.status === 'DELIVERED'
                                    ? 'Đã giao'
                                    : order.status === 'CANCELLED'
                                      ? 'Đã huỷ'
                                      : 'Đã hoàn'}
                        </span>
                      </div>
                    </div>

                    {/* Order items summary */}
                    <div className="mt-3 space-y-1 border-t border-border pt-3">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm text-gray-600"
                        >
                          <span className="truncate">
                            {item.name}
                            <span className="text-gray-400">
                              {' '}
                              x{item.quantity}
                            </span>
                          </span>
                          <span className="shrink-0 font-medium text-foreground">
                            {formatPrice(Number(item.price) * item.quantity)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-gray-400">
                          ...và {order.items.length - 3} sản phẩm khác
                        </p>
                      )}
                    </div>

                    {/* Payment status */}
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-gray-400">Thanh toán:</span>
                      <span
                        className={`font-medium ${
                          order.paymentStatus === 'PAID'
                            ? 'text-green-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {order.paymentStatus === 'PAID'
                          ? '✅ Đã thanh toán'
                          : order.paymentMethod === 'COD'
                            ? '💵 Thanh toán khi nhận hàng'
                            : '🏦 Chờ chuyển khoản'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

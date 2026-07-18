import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice, formatDate, formatNumber } from '@/lib/utils'

export default async function AdminDashboard() {
  const user = await getAuthUser()
  if (!user || user.role !== 'ADMIN') redirect('/auth/login')

  const [totalOrders, totalRevenue, activeProducts, totalCustomers, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
    ])

  const stats = [
    {
      label: 'Total Orders',
      value: formatNumber(totalOrders),
      icon: '📦',
      color: 'bg-primary/20',
      barColor: 'bg-primary',
      barWidth: '70%',
    },
    {
      label: 'Revenue (VND)',
      value: formatPrice(totalRevenue._sum.total ?? 0),
      icon: '💰',
      color: 'bg-secondary/30',
      barColor: 'bg-secondary-dark',
      barWidth: '55%',
    },
    {
      label: 'Active Products',
      value: formatNumber(activeProducts),
      icon: '🛍️',
      color: 'bg-accent/30',
      barColor: 'bg-accent-dark',
      barWidth: '80%',
    },
    {
      label: 'Total Customers',
      value: formatNumber(totalCustomers),
      icon: '👥',
      color: 'bg-primary/10',
      barColor: 'bg-primary',
      barWidth: '40%',
    },
  ]

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-indigo-100 text-indigo-700',
    SHIPPING: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your pet shop</p>
      </div>

      {/* ── Stats Cards ──────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${stat.color}`}>
                {stat.label}
              </span>
            </div>
            <p className="mb-2 font-display text-2xl font-bold text-foreground">{stat.value}</p>
            {/* Chart bar placeholder */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${stat.barColor}`}
                style={{ width: stat.barWidth }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Orders ────────────────────── */}
      <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="font-display text-sm font-semibold text-primary-dark transition-colors hover:text-primary"
          >
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-border text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="pb-3 pr-4">Order Code</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-medium text-foreground">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary-dark hover:underline"
                      >
                        {order.orderCode}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{order.user.name}</td>
                    <td className="py-3 pr-4 font-semibold text-foreground">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{formatDate(order.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

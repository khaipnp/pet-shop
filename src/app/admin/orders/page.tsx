import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { formatPrice, formatDate, formatNumber } from '@/lib/utils'
import { OrdersFilter } from './orders-filter'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPING', label: 'Shipping' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
]

const PAYMENT_OPTIONS = [
  { value: '', label: 'All Payments' },
  { value: 'COD', label: 'COD' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
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

const paymentStatusColors: Record<string, string> = {
  UNPAID: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
}

interface Props {
  searchParams: Promise<{
    status?: string
    payment?: string
    page?: string
  }>
}

const ITEMS_PER_PAGE = 20

export default async function AdminOrdersPage(props: Props) {
  const user = await getAuthUser()
  if (!user || user.role !== 'ADMIN') redirect('/auth/login')

  const searchParams = await props.searchParams
  const statusFilter = searchParams.status || ''
  const paymentFilter = searchParams.payment || ''
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1)

  const where: Record<string, unknown> = {}
  if (statusFilter) where.status = statusFilter
  if (paymentFilter) where.paymentMethod = paymentFilter

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: { user: { select: { name: true } } },
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-gray-500">{formatNumber(totalCount)} total orders</p>
      </div>

      {/* Filters */}
      <OrdersFilter
        currentStatus={statusFilter}
        currentPayment={paymentFilter}
        statusOptions={STATUS_OPTIONS}
        paymentOptions={PAYMENT_OPTIONS}
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border-2 border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-border bg-muted/50">
              <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
                Order Code
              </th>
              <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
                Customer
              </th>
              <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
                Total
              </th>
              <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
                Payment
              </th>
              <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="px-4 py-3 text-right font-display text-xs font-bold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{order.orderCode}</td>
                  <td className="px-4 py-3 text-gray-600">{order.user.name}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-500">{order.paymentMethod}</span>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="rounded-lg border-2 border-border px-3 py-1.5 font-display text-xs font-semibold text-gray-600 transition-all hover:border-primary hover:text-primary-dark"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/orders?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ''}${paymentFilter ? `&payment=${paymentFilter}` : ''}`}
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
                    href={`/admin/orders?page=${p}${statusFilter ? `&status=${statusFilter}` : ''}${paymentFilter ? `&payment=${paymentFilter}` : ''}`}
                    className="flex size-9 items-center justify-center rounded-xl font-display text-sm font-semibold text-gray-600 transition-all hover:bg-muted"
                  >
                    {p}
                  </Link>
                )}
              </span>
            ))}

          {page < totalPages && (
            <Link
              href={`/admin/orders?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ''}${paymentFilter ? `&payment=${paymentFilter}` : ''}`}
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

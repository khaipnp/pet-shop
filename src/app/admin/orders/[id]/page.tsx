import { notFound, redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { OrderStatusManager } from './order-status-manager'

interface Props {
  params: Promise<{ id: string }>
}

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

export default async function AdminOrderDetailPage(props: Props) {
  const user = await getAuthUser()
  if (!user || user.role !== 'ADMIN') redirect('/auth/login')

  const { id } = await props.params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: true,
    },
  })

  if (!order) notFound()

  const STATUS_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPING', 'CANCELLED'],
    SHIPPING: ['DELIVERED', 'CANCELLED'],
    DELIVERED: ['REFUNDED'],
    CANCELLED: [],
    REFUNDED: [],
  }

  const possibleTransitions = STATUS_TRANSITIONS[order.status] || []

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between print:flex-col print:gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Order {order.orderCode}
          </h1>
          <p className="text-sm text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <span
            className={`inline-block rounded-full px-3 py-1 font-display text-sm font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}
          >
            {order.status}
          </span>
          <button
            onClick={() => window.print()}
            className="rounded-xl border-2 border-border px-4 py-2 font-display text-sm font-semibold text-gray-600 transition-all hover:bg-muted"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 print:grid-cols-1">
        {/* Customer Info */}
        <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-display text-base font-bold text-foreground">Customer Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium text-foreground">{order.user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-foreground">{order.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium text-foreground">{order.phone}</span>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-display text-base font-bold text-foreground">Shipping Info</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Full Name</span>
              <p className="font-medium text-foreground">{order.fullName}</p>
            </div>
            <div>
              <span className="text-gray-500">Address</span>
              <p className="font-medium text-foreground">
                {order.address}, {order.city}
                {order.district ? `, ${order.district}` : ''}
                {order.ward ? `, ${order.ward}` : ''}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Phone</span>
              <p className="font-medium text-foreground">{order.phone}</p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-display text-base font-bold text-foreground">Payment Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Method</span>
              <span className="font-medium text-foreground">{order.paymentMethod === 'COD' ? 'COD' : 'Bank Transfer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100 text-gray-700'}`}
              >
                {order.paymentStatus}
              </span>
            </div>
            {order.note && (
              <div>
                <span className="text-gray-500">Note</span>
                <p className="mt-1 rounded-lg bg-muted p-2 text-xs text-gray-600">{order.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-display text-base font-bold text-foreground">Order Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-border text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4">Price</th>
                <th className="pb-3 pr-4">Qty</th>
                <th className="pb-3 pr-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium text-foreground">{item.name}</td>
                  <td className="py-3 pr-4 text-gray-600">{formatPrice(Number(item.price))}</td>
                  <td className="py-3 pr-4 text-gray-600">{item.quantity}</td>
                  <td className="py-3 pr-4 text-right font-semibold text-foreground">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-4 pr-4 text-right text-sm text-gray-500">
                  Subtotal
                </td>
                <td className="pt-4 text-right font-medium text-foreground">
                  {formatPrice(order.subtotal)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="pr-4 text-right text-sm text-gray-500">
                  Shipping
                </td>
                <td className="text-right font-medium text-foreground">
                  {formatPrice(order.shippingFee)}
                </td>
              </tr>
              {Number(order.discount) > 0 && (
                <tr>
                  <td colSpan={3} className="pr-4 text-right text-sm text-green-600">
                    Discount
                  </td>
                  <td className="text-right font-medium text-green-600">
                    -{formatPrice(order.discount)}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="pr-4 text-right font-display text-base font-bold text-foreground">
                  Total
                </td>
                <td className="text-right font-display text-base font-bold text-primary-dark">
                  {formatPrice(order.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Status Management */}
      {possibleTransitions.length > 0 && (
        <OrderStatusManager
          orderId={order.id}
          currentStatus={order.status}
          possibleTransitions={possibleTransitions}
        />
      )}
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'

interface FilterOptions {
  value: string
  label: string
}

export function OrdersFilter({
  currentStatus,
  currentPayment,
  statusOptions,
  paymentOptions,
}: {
  currentStatus: string
  currentPayment: string
  statusOptions: FilterOptions[]
  paymentOptions: FilterOptions[]
}) {
  const router = useRouter()

  const handleChange = (key: string, value: string) => {
    const params = new URLSearchParams()
    if (value) params.set(key, value)
    if (key === 'status' && currentPayment) params.set('payment', currentPayment)
    if (key === 'payment' && currentStatus) params.set('status', currentStatus)
    router.push(`/admin/orders?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={currentStatus}
        onChange={(e) => handleChange('status', e.target.value)}
        className="rounded-xl border-2 border-border bg-card px-4 py-2.5 font-display text-sm font-semibold text-gray-600 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={currentPayment}
        onChange={(e) => handleChange('payment', e.target.value)}
        className="rounded-xl border-2 border-border bg-card px-4 py-2.5 font-display text-sm font-semibold text-gray-600 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
      >
        {paymentOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {(currentStatus || currentPayment) && (
        <button
          onClick={() => router.push('/admin/orders')}
          className="rounded-xl px-4 py-2.5 font-display text-sm font-semibold text-gray-500 transition-all hover:bg-muted"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}

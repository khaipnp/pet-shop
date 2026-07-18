'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  PROCESSING: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  SHIPPING: 'bg-purple-100 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  REFUNDED: 'bg-gray-100 text-gray-700 border-gray-200',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPING: 'Shipping',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
}

export function OrderStatusManager({
  orderId,
  currentStatus,
  possibleTransitions,
}: {
  orderId: string
  currentStatus: string
  possibleTransitions: string[]
}) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Change status from ${currentStatus} to ${newStatus}?`)) return

    setUpdating(true)
    setError('')

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update status')
      }
    } catch {
      setError('Network error')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm print:hidden">
      <h2 className="mb-3 font-display text-base font-bold text-foreground">Update Status</h2>

      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm text-gray-500">Current:</span>
        <span
          className={`inline-block rounded-full border-2 px-3 py-1 font-display text-sm font-semibold ${statusColors[currentStatus] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
        >
          {statusLabels[currentStatus] || currentStatus}
        </span>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {possibleTransitions.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={updating}
            className={`rounded-full border-2 px-4 py-2 font-display text-sm font-semibold transition-all disabled:opacity-50 ${statusColors[status] || 'bg-gray-100 text-gray-700 border-gray-200'} hover:shadow-md`}
          >
            {updating ? '...' : `→ ${statusLabels[status] || status}`}
          </button>
        ))}
      </div>
    </div>
  )
}

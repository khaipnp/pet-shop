'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface CartItemData {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  compareAt: number | null
  quantity: number
  stock: number
}

export default function CartItemRow({ item }: { item: CartItemData }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(item.quantity)

  const updateQuantity = async (newQty: number) => {
    if (newQty < 1 || newQty > item.stock) return
    setLoading(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, quantity: newQty }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }
      setQuantity(newQty)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update quantity')
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/cart?itemId=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to remove item')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove item')
    } finally {
      setLoading(false)
    }
  }

  const lineTotal = item.price * quantity

  return (
    <div className="flex items-start gap-4 rounded-2xl border-2 border-border bg-card p-4 shadow-sm transition-all hover:shadow-md">
      {/* Image placeholder */}
      <Link href={`/shop/${item.slug}`} className="shrink-0">
        <div className="size-24 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20" />
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div>
          <Link
            href={`/shop/${item.slug}`}
            className="font-display text-base font-semibold text-foreground transition-colors hover:text-primary-dark line-clamp-1"
          >
            {item.name}
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-display text-base font-bold text-primary-dark">
              {formatPrice(item.price)}
            </span>
            {item.compareAt && item.compareAt > item.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(item.compareAt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateQuantity(quantity - 1)}
              disabled={quantity <= 1 || loading}
              className="flex size-8 items-center justify-center rounded-lg border-2 border-border bg-card text-base font-bold text-gray-600 transition-colors hover:bg-muted disabled:opacity-30"
            >
              −
            </button>
            <span className="flex h-8 w-10 items-center justify-center rounded-lg border-2 border-border bg-card font-display text-sm font-semibold">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(quantity + 1)}
              disabled={quantity >= item.stock || loading}
              className="flex size-8 items-center justify-center rounded-lg border-2 border-border bg-card text-base font-bold text-gray-600 transition-colors hover:bg-muted disabled:opacity-30"
            >
              +
            </button>
          </div>

          {/* Line total + remove */}
          <div className="flex items-center gap-3">
            <span className="font-display text-sm font-bold text-foreground">
              {formatPrice(lineTotal)}
            </span>
            <button
              type="button"
              onClick={removeItem}
              disabled={loading}
              className="text-sm font-medium text-gray-400 transition-colors hover:text-red-500"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface AddToCartButtonProps {
  productId: string
  productName: string
  productPrice: number
  stock: number
}

export default function AddToCartButton({
  productId,
  productName,
  productPrice,
  stock,
}: AddToCartButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const handleAdd = async () => {
    setLoading(true)
    setSuccess(false)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add to cart')
      }
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add to cart')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          className="flex size-9 items-center justify-center rounded-xl border-2 border-border bg-card text-lg font-bold text-gray-600 transition-colors hover:bg-muted disabled:opacity-30"
        >
          −
        </button>
        <span className="flex h-9 w-12 items-center justify-center rounded-xl border-2 border-border bg-card font-display font-semibold">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
          disabled={quantity >= stock}
          className="flex size-9 items-center justify-center rounded-xl border-2 border-border bg-card text-lg font-bold text-gray-600 transition-colors hover:bg-muted disabled:opacity-30"
        >
          +
        </button>
      </div>

      <Button
        variant="primary"
        size="lg"
        disabled={loading || stock === 0}
        onClick={handleAdd}
        className="flex-1"
      >
        {loading
          ? '⏳ Đang thêm...'
          : success
            ? '✅ Đã thêm vào giỏ'
            : stock === 0
              ? 'Hết hàng'
              : '🛒 Thêm vào giỏ hàng'}
      </Button>
    </>
  )
}

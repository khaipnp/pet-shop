'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────

interface CartItemInfo {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string | null
}

interface CheckoutFormProps {
  items: CartItemInfo[]
  subtotal: number
  shippingFee: number
  total: number
  defaultName: string
  defaultPhone: string
}

// ─── Client Component ──────────────────────────────────

export default function CheckoutForm({
  items,
  subtotal,
  shippingFee,
  total,
  defaultName,
  defaultPhone,
}: CheckoutFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER'>('COD')
  const [form, setForm] = useState({
    fullName: defaultName,
    phone: defaultPhone,
    address: '',
    city: '',
    note: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!form.fullName.trim()) {
      setError('Vui lòng nhập họ tên')
      return
    }
    if (!form.phone.trim()) {
      setError('Vui lòng nhập số điện thoại')
      return
    }
    if (!form.address.trim()) {
      setError('Vui lòng nhập địa chỉ')
      return
    }
    if (!form.city.trim()) {
      setError('Vui lòng nhập thành phố')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          note: form.note,
          paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          subtotal,
          shippingFee,
          total,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Đặt hàng thất bại')
      }

      // Redirect to order confirmation
      router.push(`/account?order=${data.orderCode}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi đặt hàng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Shipping Information ──────────────────────── */}
      <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-bold text-foreground">
          📮 Thông tin giao hàng
        </h2>

        <div className="space-y-4">
          <Input
            label="Họ và tên"
            name="fullName"
            placeholder="Nguyễn Văn A"
            value={form.fullName}
            onChange={handleChange}
            required
          />
          <Input
            label="Số điện thoại"
            name="phone"
            type="tel"
            placeholder="0912345678"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <Input
            label="Địa chỉ"
            name="address"
            placeholder="Số nhà, tên đường, phường/xã"
            value={form.address}
            onChange={handleChange}
            required
          />
          <Input
            label="Thành phố"
            name="city"
            placeholder="Hồ Chí Minh"
            value={form.city}
            onChange={handleChange}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 font-display">
              Ghi chú (không bắt buộc)
            </label>
            <textarea
              name="note"
              placeholder="Ghi chú cho đơn hàng..."
              value={form.note}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* ── Payment Method ──────────────────────────── */}
      <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-bold text-foreground">
          💳 Phương thức thanh toán
        </h2>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-border p-4 transition-all hover:bg-muted has-checked:border-primary has-checked:bg-primary/5">
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === 'COD'}
              onChange={() => setPaymentMethod('COD')}
              className="size-4 accent-primary"
            />
            <div>
              <p className="font-display text-sm font-semibold text-foreground">
                💵 Thanh toán khi nhận hàng (COD)
              </p>
              <p className="text-xs text-gray-500">
                Nhận hàng và thanh toán trực tiếp cho nhân viên giao hàng
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-border p-4 transition-all hover:bg-muted has-checked:border-primary has-checked:bg-primary/5">
            <input
              type="radio"
              name="paymentMethod"
              value="BANK_TRANSFER"
              checked={paymentMethod === 'BANK_TRANSFER'}
              onChange={() => setPaymentMethod('BANK_TRANSFER')}
              className="size-4 accent-primary"
            />
            <div>
              <p className="font-display text-sm font-semibold text-foreground">
                🏦 Chuyển khoản ngân hàng
              </p>
              <p className="text-xs text-gray-500">
                Chuyển khoản qua SePay — quét mã QR để thanh toán
              </p>
            </div>
          </label>
        </div>

        {/* SePay QR placeholder */}
        {paymentMethod === 'BANK_TRANSFER' && (
          <div className="mt-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-6 text-center">
            <div className="mx-auto mb-3 flex size-32 items-center justify-center rounded-xl bg-white shadow-md">
              <div className="text-center">
                <span className="text-4xl">🏦</span>
                <p className="mt-1 text-xs font-medium text-gray-500">SePay QR</p>
              </div>
            </div>
            <p className="text-sm font-medium text-foreground">
              Quét mã QR để thanh toán
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Nội dung chuyển khoản: Mã đơn hàng sẽ được tạo sau khi đặt
            </p>
          </div>
        )}
      </div>

      {/* ── Error ──────────────────────────────────── */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
          ❌ {error}
        </div>
      )}

      {/* ── Place Order ──────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-lg font-bold text-foreground">
          Tổng:{' '}
          <span className="text-primary-dark">{formatPrice(total)}</span>
        </p>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            '⏳ Đang xử lý...'
          ) : (
            <>
              🎉 Đặt hàng{' '}
              <span className="text-sm opacity-80">
                ({formatPrice(total)})
              </span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

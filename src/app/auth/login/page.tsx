'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/account'

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.email.trim() || !form.password.trim()) {
      setError('Vui lòng nhập email và mật khẩu')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border-2 border-border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">
              🔑 Đăng nhập
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Đăng nhập để mua sắm và quản lý đơn hàng
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Mật khẩu"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />

            {error && (
              <p className="text-sm font-medium text-red-500">❌ {error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? '⏳ Đang đăng nhập...' : '🔑 Đăng nhập'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <Link
              href="/auth/register"
              className="font-semibold text-primary-dark transition-colors hover:text-primary"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

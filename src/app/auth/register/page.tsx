'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const { name, email, password, confirmPassword } = form

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Đăng ký thất bại')
      }

      // Auto-login after registration — redirect to account
      router.push('/account')
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
              📝 Đăng ký
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Tạo tài khoản để mua sắm tại Scrumbles
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Họ và tên"
              name="name"
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={handleChange}
              required
            />
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
              placeholder="Ít nhất 6 ký tự"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Input
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
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
              {loading ? '⏳ Đang xử lý...' : '📝 Đăng ký'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link
              href="/auth/login"
              className="font-semibold text-primary-dark transition-colors hover:text-primary"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

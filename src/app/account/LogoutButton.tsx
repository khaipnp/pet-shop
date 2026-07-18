'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch {
      // fallback: clear cookie client-side and redirect
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      router.push('/')
      router.refresh()
    }
  }

  return (
    <Button
      variant="ghost"
      className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
      onClick={handleLogout}
    >
      🚪 Đăng xuất
    </Button>
  )
}

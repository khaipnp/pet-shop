'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface SortSelectProps {
  currentSort: string
}

function SortSelectInner({ currentSort }: SortSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set('sort', e.target.value)
    } else {
      params.delete('sort')
    }
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className="rounded-xl border-2 border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
    >
      <option value="">Mới nhất</option>
      <option value="price_asc">Giá: Thấp → Cao</option>
      <option value="price_desc">Giá: Cao → Thấp</option>
      <option value="name_asc">Tên: A → Z</option>
      <option value="sales">Bán chạy</option>
    </select>
  )
}

export default function SortSelect(props: SortSelectProps) {
  return (
    <Suspense fallback={<div className="h-10 w-40 animate-pulse rounded-xl bg-muted" />}>
      <SortSelectInner {...props} />
    </Suspense>
  )
}

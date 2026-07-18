'use client'

import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { Product, Category } from '@prisma/client'

interface ProductWithCategory extends Product {
  category: { name: string } | null
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
}

export function ProductsTable({ products }: { products: ProductWithCategory[] }) {
  const handleDelete = async (slug: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return

    const res = await fetch(`/api/products/${slug}`, { method: 'DELETE' })
    if (res.ok) {
      window.location.reload()
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to delete product')
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-border bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b-2 border-border bg-muted/50">
            <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
              Price
            </th>
            <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
              Stock
            </th>
            <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
              Category
            </th>
            <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
              Sales
            </th>
            <th className="px-4 py-3 text-right font-display text-xs font-bold uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-gray-400">
                No products found
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{product.name}</span>
                    <span className="text-xs text-gray-400">/{product.slug}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-foreground">
                  {formatPrice(product.price)}
                  {product.compareAt && (
                    <span className="ml-1 text-xs text-gray-400 line-through">
                      {formatPrice(product.compareAt)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      product.stock > 10
                        ? 'text-green-600'
                        : product.stock > 0
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[product.status] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {product.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {product.category?.name || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">{product.salesCount}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.slug}/edit`}
                      className="rounded-lg border-2 border-border px-3 py-1.5 font-display text-xs font-semibold text-gray-600 transition-all hover:border-accent hover:bg-accent/10 hover:text-accent-dark"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.slug, product.name)}
                      className="rounded-lg border-2 border-border px-3 py-1.5 font-display text-xs font-semibold text-gray-500 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

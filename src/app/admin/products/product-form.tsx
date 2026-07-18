'use client'

import { useState, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'
import type { Category } from '@prisma/client'

const PET_TYPES = [
  { value: '', label: 'All Pets' },
  { value: 'dog', label: '🐕 Dog' },
  { value: 'cat', label: '🐈 Cat' },
  { value: 'both', label: '🐾 Both' },
]

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
]

export function ProductForm({
  categories,
  initialData,
}: {
  categories: Pick<Category, 'id' | 'name'>[]
  initialData?: {
    name: string
    slug: string
    description: string
    price: number
    compareAt: number | null
    stock: number
    categoryId: string | null
    petType: string | null
    status: string
    featured: boolean
    tags: string[]
  }
}) {
  const router = useRouter()
  const isEditing = !!initialData
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState(initialData?.name || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value)
      if (!slugManuallyEdited) {
        setSlug(slugify(value))
      }
    },
    [slugManuallyEdited],
  )

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      slug: (form.elements.namedItem('slug') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      price: parseFloat((form.elements.namedItem('price') as HTMLInputElement).value),
      compareAt: (form.elements.namedItem('compareAt') as HTMLInputElement).value
        ? parseFloat((form.elements.namedItem('compareAt') as HTMLInputElement).value)
        : null,
      stock: parseInt((form.elements.namedItem('stock') as HTMLInputElement).value, 10) || 0,
      categoryId: (form.elements.namedItem('categoryId') as HTMLSelectElement).value || null,
      petType: (form.elements.namedItem('petType') as HTMLSelectElement).value || null,
      status: (form.elements.namedItem('status') as HTMLSelectElement).value,
      featured: (form.elements.namedItem('featured') as HTMLInputElement).checked,
      tags: (form.elements.namedItem('tags') as HTMLInputElement).value
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean),
    }

    const url = isEditing
      ? `/api/products/${initialData!.slug}`
      : '/api/products'
    const method = isEditing ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.push('/admin/products')
        router.refresh()
      } else {
        const body = await res.json()
        setError(body.error || 'Something went wrong')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-gray-700 font-display">
            Name *
          </label>
          <input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-foreground placeholder:text-gray-400 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
            placeholder="Premium Dog Bed"
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="slug" className="text-sm font-medium text-gray-700 font-display">
            Slug *
          </label>
          <input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              setSlugManuallyEdited(true)
            }}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-foreground placeholder:text-gray-400 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
            placeholder="premium-dog-bed"
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-gray-700 font-display">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-foreground placeholder:text-gray-400 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
          placeholder="Product description..."
          defaultValue={initialData?.description || ''}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Price */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="text-sm font-medium text-gray-700 font-display">
            Price (VND) *
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={initialData?.price || ''}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
            placeholder="150000"
          />
        </div>

        {/* Compare At Price */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="compareAt" className="text-sm font-medium text-gray-700 font-display">
            Compare At Price
          </label>
          <input
            id="compareAt"
            name="compareAt"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initialData?.compareAt || ''}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
            placeholder="200000"
          />
        </div>

        {/* Stock */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="stock" className="text-sm font-medium text-gray-700 font-display">
            Stock *
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={initialData?.stock ?? 0}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoryId" className="text-sm font-medium text-gray-700 font-display">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={initialData?.categoryId || ''}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pet Type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="petType" className="text-sm font-medium text-gray-700 font-display">
            Pet Type
          </label>
          <select
            id="petType"
            name="petType"
            defaultValue={initialData?.petType || ''}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            {PET_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium text-gray-700 font-display">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={initialData?.status || 'ACTIVE'}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tags" className="text-sm font-medium text-gray-700 font-display">
            Tags (comma separated)
          </label>
          <input
            id="tags"
            name="tags"
            defaultValue={initialData?.tags?.join(', ') || ''}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-foreground placeholder:text-gray-400 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
            placeholder="new, sale, popular"
          />
        </div>

        {/* Featured */}
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={initialData?.featured || false}
              className="size-5 rounded-lg border-2 border-border text-primary transition-all focus:ring-4 focus:ring-primary/20"
            />
            <span className="font-display text-sm font-semibold text-gray-700">
              Featured product
            </span>
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-display text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </button>
        <a
          href="/admin/products"
          className="rounded-2xl border-2 border-border px-6 py-3 font-display text-sm font-semibold text-gray-600 transition-all hover:bg-muted"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}

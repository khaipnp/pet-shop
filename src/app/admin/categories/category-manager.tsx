'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'
import type { Category } from '@prisma/client'

interface CategoryWithCount extends Category {
  _count: { products: number }
}

export function CategoryManager({
  categories,
  petTypeIcons,
  formatDate,
}: {
  categories: CategoryWithCount[]
  petTypeIcons: Record<string, string>
  formatDate: (d: Date | string | null | undefined) => string
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Add form state
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [slugAuto, setSlugAuto] = useState(true)
  const [newIcon, setNewIcon] = useState('')
  const [newPetType, setNewPetType] = useState('')

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editPetType, setEditPetType] = useState('')

  const resetAddForm = () => {
    setNewName('')
    setNewSlug('')
    setSlugAuto(true)
    setNewIcon('')
    setNewPetType('')
  }

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName.trim(),
        slug: newSlug.trim() || slugify(newName),
        icon: newIcon.trim() || null,
        petType: newPetType || null,
      }),
    })

    if (res.ok) {
      resetAddForm()
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create category')
    }
    setSubmitting(false)
  }

  const startEdit = (cat: CategoryWithCount) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditSlug(cat.slug)
    setEditIcon(cat.icon || '')
    setEditPetType(cat.petType || '')
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setError('')
  }

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editName.trim() || !editingId) return
    setSubmitting(true)
    setError('')

    const res = await fetch(`/api/categories/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editName.trim(),
        slug: editSlug.trim(),
        icon: editIcon.trim() || null,
        petType: editPetType || null,
      }),
    })

    if (res.ok) {
      setEditingId(null)
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to update category')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string, name: string, productCount: number) => {
    const msg =
      productCount > 0
        ? `Delete "${name}"? ${productCount} product(s) will be uncategorized.`
        : `Delete "${name}"?`
    if (!confirm(msg)) return

    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to delete category')
    }
  }

  const handleNewNameChange = (value: string) => {
    setNewName(value)
    if (slugAuto) setNewSlug(slugify(value))
  }

  return (
    <>
      {/* Add Category Form */}
      <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-display text-base font-bold text-foreground">Add Category</h2>
        {error && (
          <div className="mb-3 rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 font-display">Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => handleNewNameChange(e.target.value)}
              placeholder="Dogs"
              className="w-44 rounded-xl border-2 border-border bg-card px-3 py-2 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 font-display">Slug</label>
            <input
              type="text"
              required
              value={newSlug}
              onChange={(e) => {
                setNewSlug(e.target.value)
                setSlugAuto(false)
              }}
              placeholder="dogs"
              className="w-36 rounded-xl border-2 border-border bg-card px-3 py-2 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 font-display">Icon (emoji)</label>
            <input
              type="text"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              placeholder="🐕"
              maxLength={10}
              className="w-20 rounded-xl border-2 border-border bg-card px-3 py-2 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 font-display">Pet Type</label>
            <select
              value={newPetType}
              onChange={(e) => setNewPetType(e.target.value)}
              className="w-28 rounded-xl border-2 border-border bg-card px-3 py-2 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
            >
              <option value="">All</option>
              <option value="dog">🐕 Dog</option>
              <option value="cat">🐈 Cat</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-primary px-5 py-2 font-display text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto rounded-2xl border-2 border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-border bg-muted/50">
              <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
                Icon
              </th>
              <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
                Slug
              </th>
              <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
                Pet Type
              </th>
              <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
                Products
              </th>
              <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-gray-500">
                Created
              </th>
              <th className="px-4 py-3 text-right font-display text-xs font-bold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) =>
              editingId === cat.id ? (
                /* Inline Edit Row */
                <tr key={cat.id} className="border-b border-border bg-accent/10">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      maxLength={10}
                      className="w-14 rounded-lg border-2 border-border bg-white px-2 py-1 text-center text-sm transition-all focus:border-accent focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-36 rounded-lg border-2 border-border bg-white px-2 py-1 text-sm transition-all focus:border-accent focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="w-28 rounded-lg border-2 border-border bg-white px-2 py-1 text-sm transition-all focus:border-accent focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={editPetType}
                      onChange={(e) => setEditPetType(e.target.value)}
                      className="rounded-lg border-2 border-border bg-white px-2 py-1 text-sm transition-all focus:border-accent focus:outline-none"
                    >
                      <option value="">All</option>
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{cat._count.products}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(cat.createdAt)}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={handleEdit}
                        disabled={submitting}
                        className="rounded-lg bg-accent px-3 py-1.5 font-display text-xs font-semibold text-white transition-all hover:bg-accent-dark disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-lg border-2 border-border px-3 py-1.5 font-display text-xs font-semibold text-gray-500 transition-all hover:bg-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                /* Category Row */
                <tr
                  key={cat.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 text-xl">
                    {cat.icon || petTypeIcons[cat.petType || ''] || '📁'}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">/{cat.slug}</td>
                  <td className="px-4 py-3">
                    {cat.petType ? (
                      <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                        {petTypeIcons[cat.petType] || ''} {cat.petType}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{cat._count.products}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(cat.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="rounded-lg border-2 border-border px-3 py-1.5 font-display text-xs font-semibold text-gray-600 transition-all hover:border-accent hover:bg-accent/10 hover:text-accent-dark"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name, cat._count.products)}
                        className="rounded-lg border-2 border-border px-3 py-1.5 font-display text-xs font-semibold text-gray-500 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
            {categories.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  No categories yet. Create your first one above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

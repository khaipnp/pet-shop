import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ProductForm } from '../product-form'

export default async function NewProductPage() {
  const user = await getAuthUser()
  if (!user || user.role !== 'ADMIN') redirect('/auth/login')

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Add New Product</h1>
        <p className="text-sm text-gray-500">Create a new product for your pet shop</p>
      </div>

      <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}

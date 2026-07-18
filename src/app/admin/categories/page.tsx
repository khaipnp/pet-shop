import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { CategoryManager } from './category-manager'

export default async function AdminCategoriesPage() {
  const user = await getAuthUser()
  if (!user || user.role !== 'ADMIN') redirect('/auth/login')

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  const petTypeIcons: Record<string, string> = {
    dog: '🐕',
    cat: '🐈',
    both: '🐾',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-sm text-gray-500">
          {categories.length} category{categories.length !== 1 ? 'ies' : 'y'}
        </p>
      </div>

      {/* Add Category Form */}
      <CategoryManager categories={categories} petTypeIcons={petTypeIcons} formatDate={formatDate} />
    </div>
  )
}

import { notFound, redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ProductForm } from '../../product-form'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EditProductPage(props: Props) {
  const user = await getAuthUser()
  if (!user || user.role !== 'ADMIN') redirect('/auth/login')

  const { slug } = await props.params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  if (!product) notFound()

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Edit Product</h1>
        <p className="text-sm text-gray-500">
          Editing: <span className="font-semibold text-foreground">{product.name}</span>
        </p>
      </div>

      <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
        <ProductForm
          categories={categories}
          initialData={{
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: Number(product.price),
            compareAt: product.compareAt ? Number(product.compareAt) : null,
            stock: product.stock,
            categoryId: product.categoryId,
            petType: product.petType,
            status: product.status,
            featured: product.featured,
            tags: product.tags,
          }}
        />
      </div>
    </div>
  )
}

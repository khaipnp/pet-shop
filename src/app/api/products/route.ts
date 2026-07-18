import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { slugify } from '@/lib/utils'

// ─── GET: List products ─────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const petType = searchParams.get('petType')
    const featured = searchParams.get('featured')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    // ─── Build where clause ─────────────────────────────
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    }

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }

    if (petType) {
      where.petType = petType
    }

    if (featured === 'true') {
      where.featured = true
    }

    // ─── Fetch products ─────────────────────────────────
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: where as any,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: where as any }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List products error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ─── POST: Create product (admin only) ──────────────────
export async function POST(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      )
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { name, description, price, compareAt, costPrice, images, stock, status, featured, petType, categoryId, tags } = body

    // ─── Validation ─────────────────────────────────────
    if (!name || !description || price == null) {
      return NextResponse.json(
        { error: 'Name, description, and price are required' },
        { status: 400 },
      )
    }

    // ─── Generate slug ──────────────────────────────────
    let slug = slugify(name)
    const existingProduct = await prisma.product.findUnique({ where: { slug } })
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`
    }

    // ─── Create product ─────────────────────────────────
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        compareAt: compareAt || null,
        costPrice: costPrice || null,
        images: images || [],
        stock: stock ?? 0,
        status: status || 'ACTIVE',
        featured: featured ?? false,
        petType: petType || null,
        categoryId: categoryId || null,
        tags: tags || [],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

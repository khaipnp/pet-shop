import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { generateOrderCode } from '@/lib/utils'

// ─── GET: List orders ───────────────────────────────────
export async function GET(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit
    const status = searchParams.get('status')

    // Build where clause
    const where: Record<string, unknown> = {}

    // Regular users see only their own orders; admins see all
    if (user.role !== 'ADMIN') {
      where.userId = user.id
    }

    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: where as any,
        include: {
          items: true,
          user: user.role === 'ADMIN'
            ? { select: { id: true, email: true, name: true } }
            : false,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: where as any }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ─── POST: Create order from cart ───────────────────────
export async function POST(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { shippingFee = 0, discount = 0, note, fullName, phone, address, city, district, ward, paymentMethod = 'COD' } = body

    // ─── Get cart ──────────────────────────────────────
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 },
      )
    }

    // ─── Validate shipping info ─────────────────────────
    if (!fullName || !phone || !address || !city) {
      return NextResponse.json(
        { error: 'Full name, phone, address, and city are required' },
        { status: 400 },
      )
    }

    // ─── Validate stock and calculate subtotal ─────────
    const orderItems: Array<{
      productId: string
      name: string
      price: number
      quantity: number
      image: string | null
    }> = []

    let subtotal = 0

    for (const item of cart.items) {
      const product = item.product

      if (product.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: `Product "${product.name}" is no longer available` },
          { status: 400 },
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}"` },
          { status: 400 },
        )
      }

      const itemPrice = Number(product.price)
      subtotal += itemPrice * item.quantity

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        image: product.images[0] || null,
      })
    }

    const total = subtotal + Number(shippingFee) - Number(discount)

    // ─── Create order ──────────────────────────────────
    const order = await prisma.order.create({
      data: {
        orderCode: generateOrderCode(),
        userId: user.id,
        subtotal,
        shippingFee: Number(shippingFee),
        discount: Number(discount),
        total,
        note: note || null,
        fullName,
        phone,
        address,
        city,
        district: district || null,
        ward: ward || null,
        paymentMethod,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    })

    // ─── Update product stock & sales count ────────────
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          salesCount: { increment: item.quantity },
        },
      })
    }

    // ─── Clear cart ─────────────────────────────────────
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      )
    }

    // Fetch cart or create one if it doesn't exist
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAt: true,
                images: true,
                stock: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  compareAt: true,
                  images: true,
                  stock: true,
                  status: true,
                },
              },
            },
          },
        },
      })
    }

    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

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
    const { productId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 },
      )
    }

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      )
    }

    if (product.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 },
      )
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({ where: { userId: user.id } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } })
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      })
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAt: true,
                images: true,
                stock: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json({ cart: updatedCart }, { status: 201 })
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { itemId, quantity } = body

    if (!itemId || quantity == null) {
      return NextResponse.json(
        { error: 'Item ID and quantity are required' },
        { status: 400 },
      )
    }

    // Verify the item belongs to the user's cart
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    })

    if (!item || item.cart.userId !== user.id) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 },
      )
    }

    if (quantity < 1) {
      // Remove item if quantity is 0 or negative
      await prisma.cartItem.delete({ where: { id: itemId } })
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      })
    }

    // Return updated cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAt: true,
                images: true,
                stock: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Update cart item error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 },
      )
    }

    // Verify the item belongs to the user's cart
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    })

    if (!item || item.cart.userId !== user.id) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 },
      )
    }

    await prisma.cartItem.delete({ where: { id: itemId } })

    // Return updated cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAt: true,
                images: true,
                stock: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Remove cart item error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// ─── GET: Single order ──────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      )
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 },
      )
    }

    // Regular users can only view their own orders
    if (user.role !== 'ADMIN' && order.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 },
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ─── PATCH: Update order status (admin only) ────────────
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params
    const body = await request.json()
    const { status, paymentStatus, paymentMethod } = body

    // Validate at least one field to update
    if (!status && !paymentStatus && !paymentMethod) {
      return NextResponse.json(
        { error: 'At least one field (status, paymentStatus, paymentMethod) is required' },
        { status: 400 },
      )
    }

    // Check order exists
    const existingOrder = await prisma.order.findUnique({ where: { id } })
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 },
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (paymentMethod) updateData.paymentMethod = paymentMethod

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

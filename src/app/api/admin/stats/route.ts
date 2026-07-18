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

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 },
      )
    }

    // ─── Run all stats queries in parallel ───────────────
    const [
      totalOrders,
      paidOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: 'PAID' } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' },
      }),
      prisma.product.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderCode: true,
          total: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
          user: {
            select: { name: true },
          },
        },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 }, status: 'ACTIVE' },
        select: { id: true, name: true, slug: true, stock: true },
        orderBy: { stock: 'asc' },
        take: 10,
      }),
    ])

    return NextResponse.json({
      stats: {
        totalOrders,
        paidOrders,
        pendingOrders: totalOrders - paidOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalProducts,
        totalUsers,
        recentOrders,
        lowStockProducts,
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

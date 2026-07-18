import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { name, phone, avatar, currentPassword, newPassword } = body

    // ─── Build update data ─────────────────────────────
    const updateData: Record<string, unknown> = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json(
          { error: 'Name cannot be empty' },
          { status: 400 },
        )
      }
      updateData.name = name.trim()
    }

    if (phone !== undefined) {
      updateData.phone = phone
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar
    }

    // ─── Password change ───────────────────────────────
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to set a new password' },
          { status: 400 },
        )
      }

      const { verifyPassword } = await import('@/lib/auth')
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      })

      if (!currentUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 },
        )
      }

      const isValid = await verifyPassword(currentPassword, currentUser.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 },
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters' },
          { status: 400 },
        )
      }

      updateData.password = await hashPassword(newPassword)
    }

    // ─── Update ────────────────────────────────────────
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 },
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // ─── Validation ─────────────────────────────────────
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 },
      )
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
      )
    }

    // ─── Check existing user ─────────────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      )
    }

    // ─── Create user ─────────────────────────────────────
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    })

    // ─── Generate JWT ────────────────────────────────────
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // ─── Set cookie ──────────────────────────────────────
    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

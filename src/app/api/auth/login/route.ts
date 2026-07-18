import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyPassword, signToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // ─── Validation ─────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    // ─── Find user ──────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      )
    }

    // ─── Verify password ────────────────────────────────
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      )
    }

    // ─── Generate JWT ────────────────────────────────────
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // ─── Set httpOnly cookie ─────────────────────────────
    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

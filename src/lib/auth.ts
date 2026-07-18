import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

// ─── Config ────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-do-not-use-in-prod'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const BCRYPT_ROUNDS = 12

// ─── Types ─────────────────────────────────────────────

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  avatar: string | null
}

// ─── Password Hashing ──────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── JWT ───────────────────────────────────────────────

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as unknown as jwt.SignOptions['expiresIn'],
  })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

// ─── Cookie Helpers ────────────────────────────────────

const TOKEN_COOKIE_NAME = 'auth_token'

export async function getTokenFromCookies(): Promise<string | undefined> {
  // In Next.js 16+, cookies() is async
  const cookieStore = await cookies()
  return cookieStore.get(TOKEN_COOKIE_NAME)?.value
}

// ─── Auth User Lookup ──────────────────────────────────

/**
 * Extracts the authenticated user from the request context.
 * Reads the JWT from cookies, verifies it, and fetches the user from the database.
 *
 * @returns The authenticated user, or null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const token = await getTokenFromCookies()
    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
      },
    })

    return user as AuthUser | null
  } catch {
    return null
  }
}

/**
 * Verifies a token from a Bearer Authorization header (API route use).
 */
export async function getAuthUserFromBearer(
  request: Request,
): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) return null

    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    if (!payload) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
      },
    })

    return user as AuthUser | null
  } catch {
    return null
  }
}

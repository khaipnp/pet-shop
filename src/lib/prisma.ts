import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  const adapter = new PrismaPg(pool)

  const client = new PrismaClient({ adapter })

  // Gracefully handle pool errors without crashing the process
  pool.on('error', (err) => {
    console.error('[Prisma] Unexpected pool error:', err)
  })

  return client
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma

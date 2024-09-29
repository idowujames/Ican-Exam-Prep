import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error'],
    transactionOptions: {
      maxWait: 5000, // default: 2000
      timeout: 10000, // default: 5000
      isolationLevel: 'Serializable', // optional, default defined by database configuration
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
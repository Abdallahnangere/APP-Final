import { PrismaClient, Decimal } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Create Prisma client if it doesn't exist
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

// Middleware to convert Decimal -> number
function convertDecimal(obj: any): any {
  if (obj instanceof Decimal) return Number(obj);
  if (Array.isArray(obj)) return obj.map(convertDecimal);
  if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = convertDecimal(obj[key]);
    }
    return result;
  }
  return obj;
}

prisma.$use(async (params, next) => {
  const result = await next(params);
  return convertDecimal(result);
});

// Assign singleton in dev
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

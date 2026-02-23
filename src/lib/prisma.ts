import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

// Use a Proxy so PrismaClient is only instantiated on first property access at runtime
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

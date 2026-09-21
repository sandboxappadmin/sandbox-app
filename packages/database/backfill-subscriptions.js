require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const accounts = await prisma.account.findMany({
    include: { subscription: true },
    orderBy: { createdAt: 'desc' },
  });
  for (const acc of accounts) {
    console.log(acc.name, '| created:', acc.createdAt.toISOString(), '| subscription:', acc.subscription?.status ?? 'MISSING');
  }
  await prisma.$disconnect();
})();
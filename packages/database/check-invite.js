require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const email = "ghlsandbox@gmail.com";

  const user = await prisma.user.findUnique({ where: { email } });
  console.log('User row:', user);

  const invitation = await prisma.invitation.findFirst({ where: { email } });
  console.log('Invitation row:', invitation);

  await prisma.$disconnect();
})();
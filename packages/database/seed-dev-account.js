require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const account = await prisma.account.create({
    data: {
      name: "Dev Workspace",
      users: {
        create: {
          clerkId: "user_3JZpUJeTEl2KYeuj6QDS4i1FdE0",
          email: "sandboxapp.admin@gmail.com",
          name: "Sandbox App Super Admin",
          role: 'OWNER',
        },
      },
      subscription: {
        create: { status: 'COMP' },
      },
    },
  });
  console.log('Created account:', account.id);
  await prisma.$disconnect();
})();
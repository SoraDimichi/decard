import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const DEFAULT_USER = {
  id: 1,
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
  password: 'password123',
};

const main = async () => {
  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: DEFAULT_USER,
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

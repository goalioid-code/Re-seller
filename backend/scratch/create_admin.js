const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@calsub.com' },
    update: {},
    create: {
      email: 'admin@calsub.com',
      password_hash: 'admin123', // In dev, we use plain text for now
      name: 'Super Admin CALSUB',
      role: 'super_admin',
      is_active: true
    },
  });
  console.log('✅ Default Admin Created:', admin);
  await prisma.$disconnect();
}

main().catch(console.error);

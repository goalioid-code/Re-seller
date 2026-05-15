const { PrismaClient } = require('@prisma/client');
const { ensureDefaultProductionStages } = require('../src/lib/productionStagesDefaults');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================================
  // Seed Commission Tiers
  // ============================================================
  console.log('📊 Seeding commission tiers...');
  const tiers = [
    { name: 'Silver', percentage: 5.0, min_orders: 0 },
    { name: 'Gold', percentage: 7.0, min_orders: 10 },
    { name: 'Platinum', percentage: 10.0, min_orders: 25 },
  ];

  for (const tier of tiers) {
    await prisma.commissionTier.upsert({
      where: { name: tier.name },
      update: {},
      create: tier,
    });
  }
  console.log('✅ Commission tiers created');

  // ============================================================
  // Seed Production Stages (satu sumber dengan migrasi + bootstrap API)
  // ============================================================
  console.log('🏭 Seeding production stages...');
  await ensureDefaultProductionStages(prisma);
  console.log('✅ Production stages ready (8 tahap, selaras order.calsub.id)');

  // ============================================================
  // Seed Rewards (Hadiah)
  // ============================================================
  console.log('🎁 Seeding rewards...');
  const rewards = [
    {
      name: 'Voucher Rp 100.000',
      description: 'Voucher belanja senilai Rp 100.000',
      points_cost: 1000,
      stock: 100,
    },
    {
      name: 'T-Shirt CALSUB Premium',
      description: 'T-Shirt eksklusif CALSUB dengan design premium',
      points_cost: 1500,
      stock: 50,
    },
    {
      name: 'Voucher Rp 500.000',
      description: 'Voucher belanja senilai Rp 500.000',
      points_cost: 5000,
      stock: 20,
    },
    {
      name: 'Jersey CALSUB Limited Edition',
      description: 'Jersey CALSUB terbatas edisi khusus reseller',
      points_cost: 7500,
      stock: 10,
    },
  ];

  for (const reward of rewards) {
    await prisma.reward.upsert({
      where: { name: reward.name },
      update: {},
      create: reward,
    });
  }
  console.log('✅ Rewards created');

  // ============================================================
  // Seed Default Admin
  // ============================================================
  console.log('👤 Seeding default admin...');
  await prisma.admin.upsert({
    where: { email: 'admin@calsub.com' },
    update: {},
    create: {
      email: 'admin@calsub.com',
      password_hash: 'admin123',
      name: 'Super Admin CALSUB',
      role: 'super_admin',
      is_active: true,
    },
  });
  console.log('✅ Default admin created');

  await prisma.systemConfig.upsert({
    where: { id: 'global' },
    update: {},
    create: { id: 'global', min_commission_withdrawal: 1_000_000 },
  });
  console.log('✅ System config');

  console.log('✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

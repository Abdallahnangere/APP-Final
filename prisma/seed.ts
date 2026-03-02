// prisma/seed.ts — Seed database with default data plans and products
// Run: npx ts-node prisma/seed.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SaukiMart database...');

  // ── Data Plans ──────────────────────────────────────────────────────────────
  await prisma.dataPlan.deleteMany();

  const plans = [
    // MTN
    { network: 'MTN',    data: '500MB', validity: '30 Days', price: 150,  planId: 101 },
    { network: 'MTN',    data: '1GB',   validity: '30 Days', price: 300,  planId: 102 },
    { network: 'MTN',    data: '2GB',   validity: '30 Days', price: 500,  planId: 103 },
    { network: 'MTN',    data: '5GB',   validity: '30 Days', price: 1200, planId: 104 },
    { network: 'MTN',    data: '10GB',  validity: '30 Days', price: 2200, planId: 105 },
    { network: 'MTN',    data: '20GB',  validity: '30 Days', price: 4000, planId: 106 },
    // AIRTEL
    { network: 'AIRTEL', data: '500MB', validity: '30 Days', price: 150,  planId: 201 },
    { network: 'AIRTEL', data: '1GB',   validity: '30 Days', price: 300,  planId: 202 },
    { network: 'AIRTEL', data: '2GB',   validity: '30 Days', price: 500,  planId: 203 },
    { network: 'AIRTEL', data: '5GB',   validity: '30 Days', price: 1200, planId: 204 },
    { network: 'AIRTEL', data: '10GB',  validity: '30 Days', price: 2200, planId: 205 },
    // GLO
    { network: 'GLO',    data: '1GB',   validity: '30 Days', price: 300,  planId: 301 },
    { network: 'GLO',    data: '2GB',   validity: '30 Days', price: 500,  planId: 302 },
    { network: 'GLO',    data: '5GB',   validity: '30 Days', price: 1200, planId: 303 },
    { network: 'GLO',    data: '10GB',  validity: '30 Days', price: 2200, planId: 304 },
  ];

  await prisma.dataPlan.createMany({ data: plans });
  console.log(`✅ Created ${plans.length} data plans`);

  // ── Products ─────────────────────────────────────────────────────────────────
  await prisma.product.deleteMany();

  const products = [
    {
      name: 'MTN SIM Card',
      description: 'Registered MTN SIM card with free 1GB data on activation',
      price: 500,
      image: 'https://via.placeholder.com/400x300?text=MTN+SIM',
      category: 'sim',
      inStock: true,
    },
    {
      name: 'Airtel SIM Card',
      description: 'Registered Airtel SIM card ready to use',
      price: 500,
      image: 'https://via.placeholder.com/400x300?text=Airtel+SIM',
      category: 'sim',
      inStock: true,
    },
    {
      name: 'Glo SIM Card',
      description: 'Registered Glo SIM card with free 2GB data',
      price: 500,
      image: 'https://via.placeholder.com/400x300?text=Glo+SIM',
      category: 'sim',
      inStock: true,
    },
    {
      name: 'Budget Smartphone Bundle',
      description: 'Entry-level smartphone + MTN SIM + 2GB data bundle',
      price: 35000,
      image: 'https://via.placeholder.com/400x300?text=Phone+Bundle',
      category: 'device',
      inStock: true,
    },
    {
      name: 'MTN Data Starter Package',
      description: '3 months data package — 10GB/month for ₦9,000 (save ₦3,600)',
      price: 9000,
      image: 'https://via.placeholder.com/400x300?text=Starter+Pack',
      category: 'package',
      inStock: true,
    },
  ];

  await prisma.product.createMany({ data: products });
  console.log(`✅ Created ${products.length} products`);

  // ── System Message ────────────────────────────────────────────────────────────
  await prisma.systemMessage.deleteMany();
  await prisma.systemMessage.create({
    data: {
      content: '🎉 Welcome to SaukiMart! Enjoy instant data delivery and 2% cashback as an agent.',
      type: 'info',
      isActive: true,
    },
  });
  console.log('✅ Created welcome system message');

  console.log('🚀 Seeding complete!');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

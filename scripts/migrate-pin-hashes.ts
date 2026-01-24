/**
 * PIN Migration Script
 * 
 * This script migrates all existing plaintext PINs to bcrypt hashes.
 * Run this ONCE after deploying the new security changes.
 * 
 * Usage: npx ts-node scripts/migrate-pin-hashes.ts
 */

import { PrismaClient } from '@prisma/client';
import { hashPin } from '../lib/security';

const prisma = new PrismaClient();

async function migrateAgentPins() {
  console.log('🔐 Starting PIN migration to bcrypt hashes...\n');

  try {
    // Fetch all agents
    const agents = await prisma.agent.findMany({
      select: {
        id: true,
        firstName: true,
        phone: true,
        pin: true,
      },
    });

    if (agents.length === 0) {
      console.log('✅ No agents found. Database is clean.');
      return;
    }

    console.log(`📊 Found ${agents.length} agents to migrate\n`);

    let updated = 0;
    let skipped = 0;

    for (const agent of agents) {
      try {
        // Check if PIN is already hashed (bcrypt hashes start with $2a$ or $2b$ or $2y$)
        if (agent.pin.startsWith('$2a$') || agent.pin.startsWith('$2b$') || agent.pin.startsWith('$2y$')) {
          console.log(`⏭️  Agent ${agent.firstName} (${agent.phone}) - PIN already hashed, skipping`);
          skipped++;
          continue;
        }

        // Hash the plaintext PIN
        const hashedPin = await hashPin(agent.pin);

        // Update in database
        await prisma.agent.update({
          where: { id: agent.id },
          data: { pin: hashedPin },
        });

        console.log(`✅ Agent ${agent.firstName} (${agent.phone}) - PIN hashed successfully`);
        updated++;
      } catch (error: any) {
        console.error(`❌ Agent ${agent.firstName} (${agent.phone}) - Error: ${error.message}`);
      }
    }

    console.log(`\n📈 Migration Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped (already hashed): ${skipped}`);
    console.log(`   📊 Total: ${agents.length}`);

    if (updated > 0) {
      console.log(`\n✨ Migration completed successfully!`);
      console.log(`   All ${updated} agent PINs are now secured with bcrypt hashing.`);
    } else if (skipped === agents.length) {
      console.log(`\n✨ All PINs are already hashed. No migration needed.`);
    }
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateAgentPins();

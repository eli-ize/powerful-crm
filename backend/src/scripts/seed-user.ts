import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Seeding database with test user...');
    
    const user = await prisma.user.upsert({
      where: { email: 'test@powerfulcrm.com' },
      update: {},
      create: {
        email: 'test@powerfulcrm.com',
        name: 'Test User',
        password: 'test123',
        role: 'SALES_REP',
        isActive: true,
      },
    });

    console.log('✅ User created/updated:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    
  } catch (error: any) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDuplicates() {
  console.log('🔍 Finding duplicate contacts...');
  
  // Find all contacts with placeId
  const contacts = await prisma.contact.findMany({
    where: {
      placeId: { not: null }
    },
    orderBy: { createdAt: 'asc' }
  });

  // Group by placeId
  const grouped = new Map();
  for (const contact of contacts) {
    if (!grouped.has(contact.placeId)) {
      grouped.set(contact.placeId, []);
    }
    grouped.get(contact.placeId).push(contact);
  }

  // Find duplicates
  let totalDeleted = 0;
  for (const [placeId, group] of grouped) {
    if (group.length > 1) {
      console.log(`\n📦 Found ${group.length} duplicates for placeId: ${placeId}`);
      console.log(`   Keeping: ${group[0].company} (created ${group[0].createdAt})`);
      
      // Delete all except the first one
      for (let i = 1; i < group.length; i++) {
        await prisma.contact.delete({
          where: { id: group[i].id }
        });
        console.log(`   ❌ Deleted: ${group[i].company} (created ${group[i].createdAt})`);
        totalDeleted++;
      }
    }
  }

  console.log(`\n✅ Cleanup complete! Deleted ${totalDeleted} duplicate contacts.`);
  await prisma.$disconnect();
}

cleanupDuplicates().catch(error => {
  console.error('Error:', error);
  prisma.$disconnect();
  process.exit(1);
});

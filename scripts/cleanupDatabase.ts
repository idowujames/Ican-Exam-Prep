// scripts/cleanupDatabase.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDatabase() {
  const questions = await prisma.question.findMany();

  for (const question of questions) {
    if (typeof question.options === 'string') {
      try {
        JSON.parse(question.options);
      } catch (e) {
        console.log(`Invalid JSON found for question ${question.id}`);
        
        // Attempt to fix the JSON
        const fixedOptions = question.options
          .replace(/'/g, '"')  // Replace single quotes with double quotes
          .replace(/\n/g, '')  // Remove newlines
          .trim();  // Remove leading/trailing whitespace
        
        try {
          JSON.parse(fixedOptions);
          
          // If parsing succeeds, update the database
          await prisma.question.update({
            where: { id: question.id },
            data: { options: fixedOptions },
          });
          
          console.log(`Fixed JSON for question ${question.id}`);
        } catch (e) {
          console.error(`Could not fix JSON for question ${question.id}`);
        }
      }
    }
  }
}

cleanupDatabase()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
    console.log('Database cleanup completed')
  });

// To run this script:
// 1. Save this file as 'scripts/cleanupDatabase.ts' in your project root
// 2. Run 'npx ts-node scripts/cleanupDatabase.ts' from your project root
// 3. Make sure you have ts-node installed: npm install -g ts-node
// 4. Ensure your database connection is properly configured in your Prisma setup
// scripts/cleanupDatabase.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDatabase() {
  const questions = await prisma.question.findMany();

  for (const question of questions) {
    if (typeof question.options === 'string') {
      try {
        // Try to parse the existing options
        const parsedOptions = JSON.parse(question.options);
        
        // If parsing succeeds, stringify it again to ensure proper formatting
        const stringifiedOptions = JSON.stringify(parsedOptions);
        
        // Update the database with the stringified version
        await prisma.question.update({
          where: { id: question.id },
          data: { options: stringifiedOptions },
        });
        
        console.log(`Updated options for question ${question.id}`);
      } catch (e) {
        console.log(`Invalid JSON found for question ${question.id}`);
        
        // Attempt to fix the JSON
        const fixedOptions = question.options
          .replace(/'/g, '"')  // Replace single quotes with double quotes
          .replace(/\n/g, '')  // Remove newlines
          .trim();  // Remove leading/trailing whitespace
        
        try {
          const parsedOptions = JSON.parse(fixedOptions);
          const stringifiedOptions = JSON.stringify(parsedOptions);
          
          // If parsing succeeds, update the database
          await prisma.question.update({
            where: { id: question.id },
            data: { options: stringifiedOptions },
          });
          
          console.log(`Fixed and updated options for question ${question.id}`);
        } catch (e) {
          console.error(`Could not fix JSON for question ${question.id}`);
        }
      }
    } else if (Array.isArray(question.options)) {
      // If options is already an array, stringify it
      const stringifiedOptions = JSON.stringify(question.options);
      
      await prisma.question.update({
        where: { id: question.id },
        data: { options: stringifiedOptions },
      });
      
      console.log(`Stringified options for question ${question.id}`);
    }
  }
}

cleanupDatabase()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Database cleanup completed');
  });

// To run this script:
// 1. Save this file as 'scripts/cleanupDatabase.js' in your project root
// 2. Run 'node scripts/cleanupDatabase.js' from your project root
// 3. Ensure your database connection is properly configured in your Prisma setup
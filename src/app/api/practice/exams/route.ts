// /app/api/practice/exams/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, Diet } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to parse diet name
function parseDietName(name: string): { course: string; year: number; month: string } | null {
  const parts = name.split(' - ');
  if (parts.length !== 2) return null;

  const [course, dateStr] = parts;
  const [month, year] = dateStr.split(' ');
  const parsedYear = parseInt(year);

  if (isNaN(parsedYear) || !['NOV', 'MAY'].includes(month)) return null;

  return { course, year: parsedYear, month };
}

// Comparison function for sorting diets
function compareDiets(a: Diet, b: Diet): number {
  const parseA = parseDietName(a.name);
  const parseB = parseDietName(b.name);

  if (!parseA && !parseB) return 0;
  if (!parseA) return 1;
  if (!parseB) return -1;

  // First, compare by year
  if (parseA.year !== parseB.year) {
    return parseB.year - parseA.year; // Sort by year descending
  }

  // If years are the same, compare by month
  const monthOrder: { [key: string]: number } = { 'NOV': 1, 'MAY': 0 };
  if (parseA.month !== parseB.month) {
    return monthOrder[parseB.month] - monthOrder[parseA.month]; // Sort by month descending within the same year
  }

  // If year and month are the same, compare by course code
  return parseA.course.localeCompare(parseB.course);
}

export async function GET() {
  try {
    const examTypes = await prisma.examType.findMany({
      include: {
        courses: {
          include: {
            diets: true
          }
        }
      },
    });

    // Sort diets for each course
    const sortedExamTypes = examTypes.map(examType => ({
      ...examType,
      courses: examType.courses.map(course => ({
        ...course,
        diets: [...course.diets].sort(compareDiets)
      }))
    }));

    return NextResponse.json(sortedExamTypes);
  } catch (error) {
    console.error('Error fetching exam types:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
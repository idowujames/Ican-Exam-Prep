// /app/api/practice/exams/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    return NextResponse.json(examTypes);
  } catch (error) {
    console.error('Error fetching exam types:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
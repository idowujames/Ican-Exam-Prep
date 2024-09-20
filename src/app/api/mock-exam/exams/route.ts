import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const examTypes = await prisma.examType.findMany({
      include: {
        courses: true
      },
    });

    return NextResponse.json(examTypes);
  } catch (error) {
    console.error('Error fetching exam types:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
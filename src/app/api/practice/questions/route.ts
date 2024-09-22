// app/api/practice/questions/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const dietId = searchParams.get('dietId');

  if (!courseId || !dietId) {
    return NextResponse.json({ error: 'Course ID and Diet ID are required' }, { status: 400 });
  }

  try {
    const questions = await prisma.question.findMany({
      where: {
        courseId: courseId,
        dietId: dietId,
      },
      select: {
        id: true,
        type: true,
        content: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        optionE: true,
        correctAnswer: true,
        explanation: true,
        simplifiedExplanation: true,
      },
      orderBy: [
        {
          type: 'asc',
        },
        {
          id: 'asc',
        },
      ],
    });

    // Transform the questions to include options as an array
    const transformedQuestions = questions.map(q => ({
      ...q,
      options: [q.optionA, q.optionB, q.optionC, q.optionD, q.optionE].filter(Boolean)
    }));

    return NextResponse.json(transformedQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
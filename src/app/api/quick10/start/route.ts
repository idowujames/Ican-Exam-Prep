// app/api/quick10/start/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId } = await request.json();

  if (!courseId) {
    return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Fetch all MCQ questions for the course
      const allQuestions = await prisma.question.findMany({
        where: {
          courseId: courseId,
          type: 'MCQ',
        },
        select: {
          id: true,
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
      });

      // Randomly select 10 questions
      const selectedQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);

      // Create a new Quick 10 session
      const quick10Session = await prisma.quick10Session.create({
        data: {
          userId: user.id,
          courseId: courseId,
          correctAnswers: 0,
          timeSpent: 0,
          questionIds: selectedQuestions.map(q => q.id),
        },
      });

      // Transform the questions to include options as an array
      const transformedQuestions = selectedQuestions.map(q => ({
        ...q,
        options: [q.optionA, q.optionB, q.optionC, q.optionD, q.optionE].filter(Boolean)
      }));

      return { id: quick10Session.id, questions: transformedQuestions };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error starting Quick 10 session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
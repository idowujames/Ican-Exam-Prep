// app/api/practice/start/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId, dietId } = await request.json();

  if (!courseId || !dietId) {
    return NextResponse.json({ error: 'Course ID and Diet ID are required' }, { status: 400 });
  }

  try {
    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Fetch questions for the practice exam
      const questions = await prisma.question.findMany({
        where: {
          courseId: courseId,
          dietId: dietId,
        },
        select: {
          id: true,
          type: true,
          content: true,
          options: true,
          correctAnswer: true,
          explanation: true,
          simplifiedExplanation: true,
        },
      });

      // Parse the options JSON
      const parsedQuestions = questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options as string) : null
      }));

      // Create a new practice exam
      const practiceExam = await prisma.practiceExam.create({
        data: {
          userId: user.id,
          courseId: courseId,
          dietId: dietId,
          totalQuestions: questions.length,
          correctAnswers: 0,
          timeSpent: 0,
          score: 0,
        },
      });

      return { id: practiceExam.id, questions: parsedQuestions, totalQuestions: questions.length };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error starting practice exam:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
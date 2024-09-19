// app/api/practice/submit-answer/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { practiceExamId, questionId, answer, timeSpent } = await request.json();

  if (!practiceExamId || !questionId || answer === undefined || timeSpent === undefined) {
    return NextResponse.json({ error: 'Practice Exam ID, Question ID, answer, and timeSpent are required' }, { status: 400 });
  }

  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = question.correctAnswer === answer;

    // Update the PracticeExam
    const updatedPracticeExam = await prisma.practiceExam.update({
      where: { id: practiceExamId },
      data: {
        correctAnswers: {
          increment: isCorrect ? 1 : 0
        },
        timeSpent: {
          increment: timeSpent
        }
      },
    });

    return NextResponse.json({ isCorrect, updatedPracticeExam });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
// app/api/quick10/submit/route.ts

import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId, questionId, answer } = await request.json();

  if (!sessionId || !questionId || answer === undefined) {
    return NextResponse.json({ error: 'Session ID, Question ID, and answer are required' }, { status: 400 });
  }

  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = question.correctAnswer === answer;

    // Update the Quick10Session
    await prisma.quick10Session.update({
      where: { id: sessionId },
      data: {
        correctAnswers: {
          increment: isCorrect ? 1 : 0
        },
        answers: {
          push: { questionId, userAnswer: answer, isCorrect }
        }
      },
    });

    return NextResponse.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error('Error submitting answer for Quick 10 session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
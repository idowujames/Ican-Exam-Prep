// src/app/api/practice/submit-answer/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { practiceExamId, questionId, answer } = await request.json();

  if (!practiceExamId || !questionId || answer === undefined) {
    return NextResponse.json({ error: 'Practice Exam ID, Question ID, and answer are required' }, { status: 400 });
  }

  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = question.correctAnswer === answer;

    // First, find the PracticeExamQuestion
    const practiceExamQuestion = await prisma.practiceExamQuestion.findFirst({
      where: {
        practiceExamId: practiceExamId,
        questionId: questionId,
      },
    });

    if (!practiceExamQuestion) {
      return NextResponse.json({ error: 'Practice Exam Question not found' }, { status: 404 });
    }

    // Then, update the found PracticeExamQuestion
    const updatedPracticeExamQuestion = await prisma.practiceExamQuestion.update({
      where: { id: practiceExamQuestion.id },
      data: {
        userAnswer: answer,
        isCorrect,
      },
    });

    return NextResponse.json({ isCorrect, practiceExamQuestion: updatedPracticeExamQuestion });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
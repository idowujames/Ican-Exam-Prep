// src/app/api/practice/summary/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const practiceExamId = searchParams.get('practiceExamId');

  if (!practiceExamId) {
    return NextResponse.json({ error: 'Practice Exam ID is required' }, { status: 400 });
  }

  try {
    const practiceExam = await prisma.practiceExam.findUnique({
      where: { id: practiceExamId },
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!practiceExam) {
      return NextResponse.json({ error: 'Practice Exam not found' }, { status: 404 });
    }

    const mcqQuestions = practiceExam.questions.filter(q => q.question.type === 'MCQ');
    const totalQuestions = mcqQuestions.length;
    const correctAnswers = mcqQuestions.filter(q => q.isCorrect).length;
    const incorrectAnswers = mcqQuestions.filter(q => q.isCorrect === false).length;
    const unanswered = mcqQuestions.filter(q => q.userAnswer === null).length;

    const startTime = practiceExam.startedAt;
    const endTime = practiceExam.completedAt || new Date();
    const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // in seconds

    const summaryData = {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unanswered,
      timeSpent,
    };

    return NextResponse.json(summaryData);
  } catch (error) {
    console.error('Error fetching summary data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

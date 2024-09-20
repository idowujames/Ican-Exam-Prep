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
  const mockExamId = searchParams.get('mockExamId');

  if (!mockExamId) {
    return NextResponse.json({ error: 'Mock Exam ID is required' }, { status: 400 });
  }

  try {
    const mockExam = await prisma.mockExam.findUnique({
      where: { id: mockExamId },
      include: { course: true },
    });

    if (!mockExam) {
      return NextResponse.json({ error: 'Mock Exam not found' }, { status: 404 });
    }

    const questions = await prisma.question.findMany({
      where: {
        courseId: mockExam.courseId,
      },
    });

    const userAnswers = mockExam.answers as { [key: string]: string };

    const summaryData = {
      totalQuestions: mockExam.totalQuestions,
      correctAnswers: mockExam.correctAnswers,
      incorrectAnswers: mockExam.totalQuestions - mockExam.correctAnswers,
      score: mockExam.score,
      timeSpent: mockExam.timeSpent,
      questions: questions.map(q => ({
        id: q.id,
        type: q.type,
        content: q.content,
        userAnswer: userAnswers[q.id] || '',
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        simplifiedExplanation: q.simplifiedExplanation,
      })),
    };

    return NextResponse.json(summaryData);
  } catch (error) {
    console.error('Error fetching summary data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
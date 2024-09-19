// app/api/practice/summary/route.ts

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
    const result = await prisma.$transaction(async (prisma) => {
      const practiceExam = await prisma.practiceExam.findUnique({
        where: { id: practiceExamId },
        include: { course: true },
      });

      if (!practiceExam) {
        throw new Error('Practice Exam not found');
      }

      // Check if summary has already been processed
      const existingActivity = await prisma.recentActivity.findFirst({
        where: {
          userId: user.id,
          courseId: practiceExam.courseId,
          activityType: 'Practice',
          completedAt: practiceExam.completedAt,
        },
      });

      if (existingActivity) {
        return {
          totalQuestions: practiceExam.totalQuestions,
          correctAnswers: practiceExam.correctAnswers,
          incorrectAnswers: practiceExam.totalQuestions - practiceExam.correctAnswers,
          score: practiceExam.score,
          timeSpent: practiceExam.timeSpent,
        };
      }

      // ... rest of your existing logic for updating UserProgress and creating RecentActivity ...

      return {
        totalQuestions: practiceExam.totalQuestions,
        correctAnswers: practiceExam.correctAnswers,
        incorrectAnswers: practiceExam.totalQuestions - practiceExam.correctAnswers,
        score: practiceExam.score,
        timeSpent: practiceExam.timeSpent,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching summary data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
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
    const practiceExam = await prisma.practiceExam.findUnique({
      where: { id: practiceExamId },
      include: {
        course: true,
      },
    });

    if (!practiceExam) {
      return NextResponse.json({ error: 'Practice Exam not found' }, { status: 404 });
    }

    const score = (practiceExam.correctAnswers / practiceExam.totalQuestions) * 100;

      // Fetch current UserProgress
  const currentProgress = await prisma.userProgress.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: practiceExam.courseId,
      },
    },
  });

  // Calculate new average score
  let newAverageScore: number;
  if (currentProgress) {
    const totalScore = currentProgress.averageScore * currentProgress.totalAttempts + score;
    newAverageScore = totalScore / (currentProgress.totalAttempts + 1);
  } else {
    newAverageScore = score;
  }

  // Update UserProgress
  await prisma.userProgress.upsert({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: practiceExam.courseId,
      },
    },
    update: {
      totalAttempts: { increment: 1 },
      totalQuestions: { increment: practiceExam.totalQuestions },
      totalCorrect: { increment: practiceExam.correctAnswers },
      totalTimeSpent: { increment: practiceExam.timeSpent },
      averageScore: newAverageScore,
    },
    create: {
      userId: user.id,
      courseId: practiceExam.courseId,
      totalAttempts: 1,
      totalQuestions: practiceExam.totalQuestions,
      totalCorrect: practiceExam.correctAnswers,
      averageScore: score,
      totalTimeSpent: practiceExam.timeSpent,
    },
  });

    // Add to RecentActivity
    await prisma.recentActivity.create({
      data: {
        userId: user.id,
        courseId: practiceExam.courseId,
        activityType: 'Practice',
        score: score,
        completedAt: new Date(),
      },
    });

    // Limit RecentActivity to last 20 entries
    const recentActivities = await prisma.recentActivity.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' },
      take: 21, // Fetch one extra to check if we need to delete
    });

    if (recentActivities.length > 20) {
      await prisma.recentActivity.delete({
        where: { id: recentActivities[20].id },
      });
    }

    const summaryData = {
      totalQuestions: practiceExam.totalQuestions,
      correctAnswers: practiceExam.correctAnswers,
      incorrectAnswers: practiceExam.totalQuestions - practiceExam.correctAnswers,
      score: score,
      timeSpent: practiceExam.timeSpent,
    };

    return NextResponse.json(summaryData);
  } catch (error) {
    console.error('Error fetching summary data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
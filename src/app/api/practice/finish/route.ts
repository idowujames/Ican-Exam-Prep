// app/api/practice/finish/route.ts

import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { practiceExamId, answers, timeSpent } = await request.json();

  if (!practiceExamId || !answers || timeSpent === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Fetch the practice exam
    const practiceExam = await prisma.practiceExam.findUnique({
      where: { id: practiceExamId },
      include: { course: true },
    });

    if (!practiceExam) {
      return NextResponse.json({ error: 'Practice exam not found' }, { status: 404 });
    }

    // Fetch questions for this practice exam
    const questions = await prisma.question.findMany({
      where: {
        courseId: practiceExam.courseId,
        dietId: practiceExam.dietId,
      },
    });

    // Calculate results
    let correctAnswers = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const totalQuestions = questions.length;
    const score = (correctAnswers / totalQuestions) * 100;

    // Update the practice exam
    const updatedPracticeExam = await prisma.practiceExam.update({
      where: { id: practiceExamId },
      data: {
        completedAt: new Date(),
        totalQuestions,
        correctAnswers,
        score,
        timeSpent,
      },
    });

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
    
      // Update user progress
      await prisma.userProgress.upsert({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: practiceExam.courseId,
          },
        },
        update: {
          totalAttempts: { increment: 1 },
          totalQuestions: { increment: totalQuestions },
          totalCorrect: { increment: correctAnswers },
          totalTimeSpent: { increment: timeSpent },
          averageScore: newAverageScore,
        },
        create: {
          userId: user.id,
          courseId: practiceExam.courseId,
          totalAttempts: 1,
          totalQuestions: totalQuestions,
          totalCorrect: correctAnswers,
          averageScore: score,
          totalTimeSpent: timeSpent,
        },
      });

    // Add to recent activity
    await prisma.recentActivity.create({
      data: {
        userId: user.id,
        courseId: practiceExam.courseId,
        activityType: 'Practice',
        score,
        completedAt: new Date(),
      },
    });

    // Manage recent activity limit (keep only last 20)
    const recentActivities = await prisma.recentActivity.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' },
      take: 21,
    });

    if (recentActivities.length > 20) {
      await prisma.recentActivity.delete({
        where: { id: recentActivities[20].id },
      });
    }

    return NextResponse.json({
      message: 'Practice exam completed successfully',
      practiceExamId: updatedPracticeExam.id,
      score,
      correctAnswers,
      totalQuestions,
      timeSpent,
    });
    
  } catch (error) {
    console.error('Error finishing practice exam:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
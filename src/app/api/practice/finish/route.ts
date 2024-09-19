// src/app/api/practice/finish/route.ts

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
    // Check if the practice exam has already been completed
    const existingPracticeExam = await prisma.practiceExam.findUnique({
      where: { id: practiceExamId },
    });

    if (existingPracticeExam && existingPracticeExam.completedAt) {
      return NextResponse.json({ error: 'Practice exam already completed' }, { status: 400 });
    }

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

    // Calculate results (only for MCQs)
    let correctAnswers = 0;
    let totalMCQs = 0;
    questions.forEach(question => {
      if (question.type === 'MCQ') {
        totalMCQs++;
        if (answers[question.id] === question.correctAnswer) {
          correctAnswers++;
        }
      }
    });

    const score = totalMCQs > 0 ? (correctAnswers / totalMCQs) * 100 : 0;

    // Update the practice exam
    const updatedPracticeExam = await prisma.practiceExam.update({
      where: { id: practiceExamId },
      data: {
        completedAt: new Date(),
        totalQuestions: totalMCQs,
        correctAnswers,
        score,
        timeSpent,
      },
    });

    // Fetch current user progress
    const currentProgress = await prisma.userProgress.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: practiceExam.courseId,
        },
      },
    });

    // Calculate new average score
    let newTotalAttempts = 1;
    let newAverageScore = score;

    if (currentProgress) {
      newTotalAttempts = currentProgress.totalAttempts + 1;
      const totalScore = currentProgress.averageScore * currentProgress.totalAttempts + score;
      newAverageScore = totalScore / newTotalAttempts;
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
        totalAttempts: newTotalAttempts,
        totalQuestions: { increment: totalMCQs },
        totalCorrect: { increment: correctAnswers },
        totalTimeSpent: { increment: timeSpent },
        averageScore: newAverageScore,
      },
      create: {
        userId: user.id,
        courseId: practiceExam.courseId,
        totalAttempts: 1,
        totalQuestions: totalMCQs,
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

    return NextResponse.json({
      message: 'Practice exam completed successfully',
      practiceExamId: updatedPracticeExam.id,
      score,
      correctAnswers,
      totalQuestions: totalMCQs,
      timeSpent,
    });
    
  } catch (error) {
    console.error('Error finishing practice exam:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
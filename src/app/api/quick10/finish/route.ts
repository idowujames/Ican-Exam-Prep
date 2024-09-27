// app/api/quick10/finish/route.ts

import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { quick10SessionId, answers, timeSpent } = await request.json();

  if (!quick10SessionId || !answers || timeSpent === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Check if the Quick 10 session has already been completed
      const existingSession = await prisma.quick10Session.findUnique({
        where: { id: quick10SessionId },
      });

      if (!existingSession) {
        throw new Error('Quick 10 session not found');
      }

      if (existingSession.completedAt) {
        throw new Error('Quick 10 session already completed');
      }

      // Fetch questions for this Quick 10 session
      const questions = await prisma.question.findMany({
        where: {
          id: { in: existingSession.questionIds },
        },
      });

      // Calculate results
      let correctAnswers = 0;
      questions.forEach(question => {
        if (answers[question.id] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = (correctAnswers / questions.length) * 100;

      // Update the Quick 10 session
      const updatedSession = await prisma.quick10Session.update({
        where: { id: quick10SessionId },
        data: {
          completedAt: new Date(),
          correctAnswers,
          timeSpent,
          answers: answers,
        },
      });

      // Fetch current user progress
      const currentProgress = await prisma.userProgress.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: existingSession.courseId,
          },
        },
      });

      const newTotalAttempts = (currentProgress?.totalAttempts || 0) + 1;
      const newTotalQuestions = (currentProgress?.totalQuestions || 0) + questions.length;
      const newTotalCorrect = (currentProgress?.totalCorrect || 0) + correctAnswers;
      const newTotalTimeSpent = (currentProgress?.totalTimeSpent || 0) + timeSpent;
      const newAverageScore = ((currentProgress?.averageScore || 0) * (newTotalAttempts - 1) + score) / newTotalAttempts;

      // Update user progress
      await prisma.userProgress.upsert({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: existingSession.courseId,
          },
        },
        update: {
          totalAttempts: newTotalAttempts,
          totalQuestions: newTotalQuestions,
          totalCorrect: newTotalCorrect,
          totalTimeSpent: newTotalTimeSpent,
          averageScore: newAverageScore,
        },
        create: {
          userId: user.id,
          courseId: existingSession.courseId,
          totalAttempts: 1,
          totalQuestions: questions.length,
          totalCorrect: correctAnswers,
          averageScore: score,
          totalTimeSpent: timeSpent,
        },
      });

      // Add to recent activity
      await prisma.recentActivity.create({
        data: {
          userId: user.id,
          courseId: existingSession.courseId,
          activityType: 'Quick 10',
          score,
          completedAt: new Date(),
        },
      });

      return {
        message: 'Quick 10 session completed successfully',
        quick10SessionId: updatedSession.id,
        score,
        correctAnswers,
        totalQuestions: questions.length,
        timeSpent,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error finishing Quick 10 session:', error);
    if (error instanceof Error) {
      if (error.message === 'Quick 10 session already completed') {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message === 'Quick 10 session not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
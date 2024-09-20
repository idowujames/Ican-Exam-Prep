import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { mockExamId, answers, timeSpent } = await request.json();

  if (!mockExamId || !answers || timeSpent === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Check if the mock exam has already been completed
      const existingMockExam = await prisma.mockExam.findUnique({
        where: { id: mockExamId },
      });

      if (existingMockExam && existingMockExam.completedAt) {
        throw new Error('Mock exam already completed');
      }

      // Fetch the mock exam
      const mockExam = await prisma.mockExam.findUnique({
        where: { id: mockExamId },
        include: { course: true },
      });

      if (!mockExam) {
        throw new Error('Mock exam not found');
      }

      // Fetch questions for this mock exam
      const questions = await prisma.question.findMany({
        where: {
          courseId: mockExam.courseId,
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

      // Update the mock exam
      const updatedMockExam = await prisma.mockExam.update({
        where: { id: mockExamId },
        data: {
          completedAt: new Date(),
          correctAnswers,
          score,
          timeSpent,
          answers: answers,// Remove the 'answers' field from here
        },
      });

      // Fetch current user progress
      const currentProgress = await prisma.userProgress.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: mockExam.courseId,
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
            courseId: mockExam.courseId,
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
          courseId: mockExam.courseId,
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
          courseId: mockExam.courseId,
          activityType: 'Mock Exam',
          score,
          completedAt: new Date(),
        },
      });

      return {
        message: 'Mock exam completed successfully',
        mockExamId: updatedMockExam.id,
        score,
        correctAnswers,
        totalQuestions: totalMCQs,
        timeSpent,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error finishing mock exam:', error);
    if (error instanceof Error && error.message === 'Mock exam already completed') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
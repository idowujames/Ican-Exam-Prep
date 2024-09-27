import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from '@/lib/prisma';

export async function GET() {
  const { getUser, isAuthenticated } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await getUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    // Fetch mock exam data
    const mockExams = await prisma.mockExam.findMany({
      where: { 
        userId: user.id,
        completedAt: { not: null }, // Only completed exams
      },
      select: {
        totalQuestions: true,
        correctAnswers: true,
      },
    });

    // Fetch practice exam data
    const practiceExams = await prisma.practiceExam.findMany({
      where: {
        userId: user.id,
        completedAt: { not: null }, // Only completed exams
      },
      select: {
        totalQuestions: true,
        correctAnswers: true,
      },
    });

    // Calculate combined statistics
    const totalQuestionsAttempted = 
      mockExams.reduce((sum, exam) => sum + exam.totalQuestions, 0) +
      practiceExams.reduce((sum, exam) => sum + exam.totalQuestions, 0);

    const totalCorrectAnswers = 
      mockExams.reduce((sum, exam) => sum + exam.correctAnswers, 0) +
      practiceExams.reduce((sum, exam) => sum + exam.correctAnswers, 0);

    const averageScore = totalQuestionsAttempted > 0
      ? (totalCorrectAnswers / totalQuestionsAttempted) * 100
      : 0;

    // Fetch study time for the last week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const studySessions = await prisma.studySession.findMany({
      where: {
        userId: user.id,
        startedAt: { gte: oneWeekAgo },
      },
    });
    const studyTimeThisWeek = studySessions.reduce((sum, session) => sum + (session.duration || 0), 0);

    // Fetch recent activity
    const recentActivity = await prisma.recentActivity.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: {
        course: true,
      },
    });

    // Count completed mock exams
    const mockExamsCompleted = mockExams.length;

    return NextResponse.json({
      totalQuestionsAttempted,
      totalCorrectAnswers,
      averageScore,
      studyTimeThisWeek,
      mockExamsCompleted,
      recentActivity: recentActivity.map(activity => ({
        type: activity.activityType,
        subject: activity.course.name,
        score: activity.score,
        completedAt: activity.completedAt,
      })),
      name: user.given_name,
    });

  } catch (error) {
    console.error('Error in dashboard API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
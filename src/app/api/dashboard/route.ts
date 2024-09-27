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
    const [mockExams, practiceExams, studySessions, recentActivity] = await Promise.all([
      prisma.mockExam.findMany({
        where: { 
          userId: user.id,
          completedAt: { not: null },
        },
        select: {
          totalQuestions: true,
          correctAnswers: true,
        },
      }),
      prisma.practiceExam.findMany({
        where: {
          userId: user.id,
          completedAt: { not: null },
        },
        select: {
          totalQuestions: true,
          correctAnswers: true,
        },
      }),
      prisma.studySession.findMany({
        where: {
          userId: user.id,
          startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.recentActivity.findMany({
        where: { userId: user.id },
        orderBy: { completedAt: 'desc' },
        take: 5,
        include: {
          course: true,
        },
      }),
    ]);

    const totalQuestionsAttempted = 
      mockExams.reduce((sum, exam) => sum + exam.totalQuestions, 0) +
      practiceExams.reduce((sum, exam) => sum + exam.totalQuestions, 0);

    const totalCorrectAnswers = 
      mockExams.reduce((sum, exam) => sum + exam.correctAnswers, 0) +
      practiceExams.reduce((sum, exam) => sum + exam.correctAnswers, 0);

    const averageScore = totalQuestionsAttempted > 0
      ? (totalCorrectAnswers / totalQuestionsAttempted) * 100
      : 0;

    const studyTimeThisWeek = studySessions.reduce((sum, session) => sum + (session.duration || 0), 0);

    const enrichedRecentActivity = await Promise.all(recentActivity.map(async (activity) => {
      if (activity.activityType === 'Practice') {
        const practiceExam = await prisma.practiceExam.findFirst({
          where: {
            userId: user.id,
            courseId: activity.courseId,
            completedAt: {
              gte: new Date(activity.completedAt.getTime() - 5000),
              lte: new Date(activity.completedAt.getTime() + 5000),
            },
          },
          include: {
            diet: true,
          },
        });

        const subject = practiceExam && practiceExam.diet
          ? practiceExam.diet.name
          : 'Unknown Diet';

        return {
          type: `Practice: ${subject}`,
          score: activity.score,
          completedAt: activity.completedAt,
        };
      } else {
        return {
          type: activity.activityType,
          subject: activity.course.name,
          score: activity.score,
          completedAt: activity.completedAt,
        };
      }
    }));

    return NextResponse.json({
      totalQuestionsAttempted,
      totalCorrectAnswers,
      averageScore,
      studyTimeThisWeek,
      mockExamsCompleted: mockExams.length,
      recentActivity: enrichedRecentActivity,
      name: user.given_name,
    });

  } catch (error) {
    console.error('Error in dashboard API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
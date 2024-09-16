import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from '@/lib/prisma';

// Define the Role type if it's not already defined elsewhere
type Role = 'STUDENT' | 'ADMIN';

// Define the interface for the user with all related data
interface UserWithRelations {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  practiceExams: Array<{
    questions: Array<any>;
    completedAt: Date | null;
    score: number | null;
    exam: {
      subject: {
        name: string;
      };
    };
  }>;
  mockExams: Array<{
    questions: Array<any>;
    completedAt: Date | null;
    score: number | null;
    exam: {
      subject: {
        name: string;
      };
    };
  }>;
  studySessions: Array<{
    startedAt: Date;
    duration: number | null;
  }>;
}

export async function GET() {
  const { getUser, isAuthenticated } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: {
        practiceExams: {
          include: {
            exam: {
              include: {
                subject: true
              }
            },
            questions: true
          }
        },
        mockExams: {
          include: {
            exam: {
              include: {
                subject: true
              }
            },
            questions: true
          }
        },
        studySessions: true,
      },
    }) as UserWithRelations | null;

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Calculate dashboard data
    const totalQuestionsAttempted = 
      (dbUser.practiceExams?.reduce((sum, exam) => sum + exam.questions.length, 0) || 0) +
      (dbUser.mockExams?.reduce((sum, exam) => sum + exam.questions.length, 0) || 0);

    const allExams = [...dbUser.practiceExams, ...dbUser.mockExams];
    const completedExams = allExams.filter(exam => exam.completedAt !== null && exam.score !== null);
    const averageScore = completedExams.length > 0
      ? completedExams.reduce((sum, exam) => sum + (exam.score || 0), 0) / completedExams.length
      : 0;

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const studyTimeThisWeek = dbUser.studySessions
      .filter(session => session.startedAt > oneWeekAgo)
      .reduce((sum, session) => sum + (session.duration || 0), 0);

    const mockExamsCompleted = dbUser.mockExams.filter(exam => exam.completedAt !== null).length;

    const recentActivity = [...dbUser.practiceExams, ...dbUser.mockExams]
      .filter(exam => exam.completedAt !== null)
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
      .slice(0, 5)
      .map(exam => ({
        type: 'practiceExams' in exam ? 'Practice' : 'Mock Exam',
        subject: exam.exam.subject.name,
        score: exam.score
      }));

    return NextResponse.json({
      totalQuestionsAttempted,
      averageScore,
      studyTimeThisWeek,
      mockExamsCompleted,
      recentActivity,
      name: user.given_name,
    });

  } catch (error) {
    console.error('Error in dashboard API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
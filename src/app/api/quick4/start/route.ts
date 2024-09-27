// app/api/quick4/start/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId } = await request.json();

  if (!courseId) {
    return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Fetch all LONG_FORM questions for the course
      const allQuestions = await prisma.question.findMany({
        where: {
          courseId: courseId,
          type: 'LONG_FORM',
        },
        select: {
          id: true,
          content: true,
        },
      });

      // Randomly select 4 questions
      const selectedQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 4);

      // Create a new Quick 4 session
      const quick4Session = await prisma.quick4Session.create({
        data: {
          userId: user.id,
          courseId: courseId,
          timeSpent: 0,
          questionIds: selectedQuestions.map(q => q.id),
        },
      });

      return { id: quick4Session.id, questions: selectedQuestions };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error starting Quick 4 session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
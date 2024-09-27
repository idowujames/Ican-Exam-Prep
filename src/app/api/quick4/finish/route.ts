// app/api/quick4/finish/route.ts

import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { quick4SessionId, timeSpent } = await request.json();

  if (!quick4SessionId || timeSpent === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Check if the Quick 4 session has already been completed
      const existingSession = await prisma.quick4Session.findUnique({
        where: { id: quick4SessionId },
      });

      if (!existingSession) {
        throw new Error('Quick 4 session not found');
      }

      if (existingSession.completedAt) {
        throw new Error('Quick 4 session already completed');
      }

      // Update the Quick 4 session
      const updatedSession = await prisma.quick4Session.update({
        where: { id: quick4SessionId },
        data: {
          completedAt: new Date(),
          timeSpent,
        },
      });

      // Add to recent activity
      await prisma.recentActivity.create({
        data: {
          userId: user.id,
          courseId: existingSession.courseId,
          activityType: 'Quick 4',
          completedAt: new Date(),
        },
      });

      return {
        message: 'Quick 4 session completed successfully',
        quick4SessionId: updatedSession.id,
        timeSpent,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error finishing Quick 4 session:', error);
    if (error instanceof Error) {
      if (error.message === 'Quick 4 session already completed') {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message === 'Quick 4 session not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
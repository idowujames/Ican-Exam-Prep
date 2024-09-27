// app/api/quick10/summary/route.ts

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
  const quick10SessionId = searchParams.get('quick10SessionId');

  if (!quick10SessionId) {
    return NextResponse.json({ error: 'Quick 10 Session ID is required' }, { status: 400 });
  }

  try {
    const session = await prisma.quick10Session.findUnique({
      where: { id: quick10SessionId },
    });

    if (!session) {
      return NextResponse.json({ error: 'Quick 10 Session not found' }, { status: 404 });
    }

    const summaryData = {
      totalQuestions: session.questionIds.length,
      correctAnswers: session.correctAnswers,
      score: (session.correctAnswers / session.questionIds.length) * 100,
      timeSpent: session.timeSpent,
      courseId: session.courseId, // Add this line
    };

    return NextResponse.json(summaryData);
  } catch (error) {
    console.error('Error fetching summary data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
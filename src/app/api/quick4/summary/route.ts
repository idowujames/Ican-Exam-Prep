// app/api/quick4/summary/route.ts

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
  const quick4SessionId = searchParams.get('quick4SessionId');

  if (!quick4SessionId) {
    return NextResponse.json({ error: 'Quick 4 Session ID is required' }, { status: 400 });
  }

  try {
    const session = await prisma.quick4Session.findUnique({
      where: { id: quick4SessionId },
      include: { course: true },
    });

    if (!session) {
      return NextResponse.json({ error: 'Quick 4 Session not found' }, { status: 404 });
    }

    const summaryData = {
      timeSpent: session.timeSpent,
      courseId: session.courseId,
      courseName: session.course.name,
    };

    return NextResponse.json(summaryData);
  } catch (error) {
    console.error('Error fetching summary data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
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
      // Fetch all questions for the course
      const allQuestions = await prisma.question.findMany({
        where: {
          courseId: courseId,
        },
        select: {
          id: true,
          type: true,
          content: true,
          options: true,
        },
      });

      // Randomly select 20 MCQs and 6 Long Form questions
      const mcqs = allQuestions.filter(q => q.type === 'MCQ').sort(() => 0.5 - Math.random()).slice(0, 20);
      const longForms = allQuestions.filter(q => q.type === 'LONG_FORM').sort(() => 0.5 - Math.random()).slice(0, 6);
      const selectedQuestions = [...mcqs, ...longForms].sort(() => 0.5 - Math.random());

      // Parse the options JSON
      const parsedQuestions = selectedQuestions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options as string) : null
      }));

      // Create a new mock exam
      const mockExam = await prisma.mockExam.create({
        data: {
          userId: user.id,
          courseId: courseId,
          totalQuestions: selectedQuestions.length,
          correctAnswers: 0,
          timeSpent: 0,
          score: 0,
        },
      });

      return { id: mockExam.id, questions: parsedQuestions };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error starting mock exam:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
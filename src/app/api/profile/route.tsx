import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const kindeUser = await getUser();
  if (!kindeUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { name, email } = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { kindeAuthId: kindeUser.id },
      data: { name, email },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
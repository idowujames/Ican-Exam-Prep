// app/api/auth/kinde-callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (user && user.id) {
    try {
      const userData = {
        kindeAuthId: user.id,
        email: user.email ?? '',
        name: `${user.given_name ?? ''} ${user.family_name ?? ''}`.trim(),
      };

      const updatedUser = await prisma.user.upsert({
        where: { kindeAuthId: user.id },
        update: userData,
        create: {
          ...userData,
          id: user.id, // Add this line to provide the id
        },
      });

      console.log('User data synced successfully:', updatedUser);

      // Redirect to the dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      console.error('Error syncing user data:', error);
      // Log the full error object
      console.error('Detailed error:', JSON.stringify(error, null, 2));
      // Log the user data that we're trying to upsert
      console.error('User data:', JSON.stringify(user, null, 2));
      
      // Return an error response instead of redirecting
      return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  console.log('No user data found, redirecting to login');
  // If no user data, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}
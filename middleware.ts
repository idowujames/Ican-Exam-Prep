// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default function middleware(req: NextRequest) {
  const authMiddleware = withAuth(req);

  // If the auth middleware redirects (user is not authenticated), return that response
  if (authMiddleware instanceof NextResponse) {
    return authMiddleware;
  }

  // Check if the user is authenticated (withAuth adds isAuthenticated to the request)
  const isAuthenticated = (req as any).isAuthenticated;

  // If authenticated and trying to access login or signup, redirect to dashboard
  if (isAuthenticated) {
    const url = req.nextUrl.clone();
    if (url.pathname === '/login' || url.pathname === '/signup') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // For all other cases, continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/admin", "/login", "/signup"]
};
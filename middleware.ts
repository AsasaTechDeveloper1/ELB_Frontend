import { NextRequest, NextResponse } from 'next/server';
import admin from './src/lib/firebaseAdmin';

const protectedPaths = ['/', '/dashboard', '/admin'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log('Middleware triggered for path:', pathname);

  const isProtected = protectedPaths.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(path + '/') ||
      (path === '/' && pathname === '/')
  );

  console.log('Is protected route:', isProtected);

  if (!isProtected) {
    console.log('Not a protected path, allowing access.');
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;
  console.log('Token from cookies:', token ? '[REDACTED]' : 'No token found');

  if (!token) {
    console.log('Redirecting to /auth/sign-in due to missing token');
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }

  try {
    await admin.auth().verifyIdToken(token);
    console.log('Token verified successfully');
    return NextResponse.next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'], // match all paths except Next.js internals
};

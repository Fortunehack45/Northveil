import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  // Simulate or execute Google token exchange
  // Set session cookie nv_session (HttpOnly, Secure, SameSite=Lax)
  const response = NextResponse.redirect(new URL('/onboarding/passkey', request.url));

  response.cookies.set({
    name: 'nv_session',
    value: 'session_' + Math.random().toString(36).slice(2, 14),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return response;
}

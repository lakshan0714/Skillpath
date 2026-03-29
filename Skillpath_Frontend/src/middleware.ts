import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Use BACKEND_URL (server side env) not NEXT_PUBLIC_ (browser only)
  const BACKEND_HOST = process.env.BACKEND_HOST || '127.0.0.1';
  const BACKEND_PORT = process.env.BACKEND_PORT || '8000';
  const BACKEND_API_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}/user/me`;

  const { pathname } = request.nextUrl;

  // Allow open access to these paths
  if (
    pathname.startsWith('/auth') ||
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/unauthorized') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/generating') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  try {
    // Call FastAPI backend to validate session
    const res = await fetch(BACKEND_API_URL, {
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
    });

    if (res.status !== 200) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const user = await res.json();

    // Role-based protection
    if (pathname.startsWith('/user_dashboard') && user.data.role !== 'user') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();

  } catch (error) {
    // Backend unreachable — redirect to login
    console.error('Middleware fetch failed:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

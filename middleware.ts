import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This empty middleware function is required
export default function middleware(request: NextRequest) {
  return NextResponse.next();
}

// This configuration tells Next.js which routes to apply the middleware to
// We're configuring it to match all routes except for some specific ones
export const config = {
  // Matcher is used to specify which paths this middleware should run on
  matcher: [
    /*
     * Match all request paths except for:
     * - API routes (/api/*)
     * - Static files (_next/static, _next/image, favicon.ico, etc.)
     * - Debug paths (/debug/*)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|debug).*)"
  ],
};
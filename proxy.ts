import { auth } from '@/lib/auth/server';

export default auth.middleware({
  loginUrl: '/auth'
});

export const config = {
  matcher: [
    // Match all paths except static files, the landing page, and the
    // pre-authentication pages (verify-email, forgot-password,
    // reset-password) that must stay reachable without a session.
    "/",
    "/((?!_next/static|_next/image|favicon.ico|verify-email|forgot-password|reset-password).*)",
  ],
};
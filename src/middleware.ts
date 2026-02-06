import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Check if user is trying to access admin routes
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "admin") {
        // Redirect non-admin users to home page
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Check if user is trying to access owner routes
    if (pathname.startsWith("/owner")) {
      if (token?.role !== "owner" && token?.role !== "admin") {
        // Redirect non-owner users to home page
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Allow access to public routes
        if (
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }

        // Protected routes require authentication
        if (
          pathname.startsWith("/bookings") ||
          pathname.startsWith("/admin") ||
          pathname.startsWith("/owner") ||
          pathname.startsWith("/profile") ||
          pathname.startsWith("/dashboard")
        ) {
          return !!token;
        }

        // All other routes are public
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api(?!/auth)|_next/static|_next/image|favicon.ico|public).*)",
  ],
};

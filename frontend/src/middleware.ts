import { withAuth } from "next-auth/middleware"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware() {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is authenticated
        if (!token) return false
        
        // Get the pathname
        const { pathname } = req.nextUrl
        
        // Always allow access to auth pages
        if (pathname.startsWith('/auth/')) return true
        
        // Require authentication for dashboard and protected routes
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        // For other routes, allow access
        return true
      },
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (home page)
     * - demo/ (demo pages for development)
     * - test- (test pages for development)
     * - rsvp/ (public RSVP pages - no authentication required)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|demo|test-|rsvp|$).*)",
  ],
}
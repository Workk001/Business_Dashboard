import { withAuth } from "next-auth/middleware"

export default withAuth(
    function middleware(req) {
        // Add any additional middleware logic here if needed
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Allow access if user has a valid token
                return !!token
            },
        },
    }
)

export const config = {
    matcher: [
        // Protect all routes except auth and public pages
        '/((?!auth|_next/static|_next/image|favicon.ico).*)',
    ]
}

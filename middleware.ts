export { default } from "next-auth/middleware"

export const config = {
    matcher: [
        "/chat/:path*",
        "/profile/:path*",
        "/api/chat/:path*",
        "/api/store-project/:path*",
        "/api/store-chats/:path*",
        // Add other protected routes here
        // But exclude "/" and auth routes
    ]
}
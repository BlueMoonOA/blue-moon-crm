export { default } from "next-auth/middleware";

// Protect these routes: users must be signed in to view them
export const config = {
  matcher: ["/deals/:path*", "/leads/:path*", "/proposals/:path*"],
};

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin";

  const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup");
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname === "/subscription-success";

  // Allow API routes to handle their own auth
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from login page
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect dashboard routes
  if (!isLoggedIn && !isAuthPage && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Protect admin routes
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

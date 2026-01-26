import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin";
  const subscriptionStatus = (req.auth?.user as { subscriptionStatus?: string } | undefined)?.subscriptionStatus;
  const hasActiveSubscription = subscriptionStatus === "trialing" || subscriptionStatus === "active";

  const isLoginPage = nextUrl.pathname === "/login";
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname === "/welcome" || nextUrl.pathname === "/b" || nextUrl.pathname === "/c";
  const isAuthSetupRoute = nextUrl.pathname.startsWith("/auth/");

  // Allow API routes to handle their own auth
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Allow auth setup routes (magic link, reset password)
  if (isAuthSetupRoute) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Allow login page for all users
  if (isLoginPage) {
    return NextResponse.next();
  }

  // Protect dashboard routes - require login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Require active subscription to access dashboard
  if (isLoggedIn && !hasActiveSubscription && !isAdminRoute) {
    // Redirect to home to sign up
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Protect admin routes
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logos/).*)"],
};

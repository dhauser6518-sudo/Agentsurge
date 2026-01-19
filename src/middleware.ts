import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin";
  const subscriptionStatus = (req.auth?.user as { subscriptionStatus?: string } | undefined)?.subscriptionStatus;
  const hasActiveSubscription = subscriptionStatus === "trialing" || subscriptionStatus === "active";

  const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup");
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname === "/subscription-success";
  const isStartTrialPage = nextUrl.pathname.startsWith("/start-trial");
  const isVerifyEmailPage = nextUrl.pathname.startsWith("/verify-email");

  // Allow API routes to handle their own auth
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from login/signup pages
  if (isAuthPage && isLoggedIn) {
    // If no active subscription, send to start-trial
    if (!hasActiveSubscription) {
      return NextResponse.redirect(new URL("/start-trial", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect dashboard routes - require login
  if (!isLoggedIn && !isAuthPage && !isPublicRoute && !isVerifyEmailPage) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Require active subscription to access dashboard (but allow start-trial and verify-email)
  if (isLoggedIn && !hasActiveSubscription && !isStartTrialPage && !isAuthPage && !isPublicRoute && !isVerifyEmailPage && !isAdminRoute) {
    return NextResponse.redirect(new URL("/start-trial", nextUrl));
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

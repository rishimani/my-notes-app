import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { GMAIL_SCOPE } from "./lib/auth";

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Only run this middleware for the mail pages
  if (!path.startsWith("/mail")) {
    return NextResponse.next();
  }

  // Public paths that don't require auth or special handling
  const publicPaths = ["/auth/signin", "/auth/gmail-permission"];
  if (publicPaths.some((publicPath) => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const token = await getToken({ req: request });

  // Redirect to login if not authenticated
  if (!token) {
    return NextResponse.redirect(
      new URL(
        `/auth/signin?callbackUrl=${encodeURIComponent(path)}`,
        request.url
      )
    );
  }

  // For mail routes, check if the user has Gmail permission
  if (path.startsWith("/mail")) {
    // Check if the token has the Gmail scope
    const hasGmailScope =
      token.scope &&
      typeof token.scope === "string" &&
      token.scope.includes(GMAIL_SCOPE);

    // Log token information for debugging (omitting sensitive data)
    console.log("Token in middleware:", {
      path,
      hasScope: !!token.scope,
      scopeType: typeof token.scope,
      hasGmailScope,
      expiresAt: token.expiresAt
        ? new Date(token.expiresAt).toISOString()
        : "none",
    });

    if (!hasGmailScope) {
      console.log(
        "User does not have Gmail permission, redirecting to Gmail permission page"
      );
      return NextResponse.redirect(
        new URL("/auth/gmail-permission", request.url)
      );
    }

    console.log("Gmail access verified, allowing access to Mail page");
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

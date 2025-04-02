import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { fetchEmails } from "@/lib/gmail";
import { GMAIL_SCOPE } from "@/lib/auth";

export async function GET(req: NextRequest) {
  console.log("Processing /api/mail request");

  try {
    // Get NextAuth token from cookies
    const token = await getToken({ req });

    if (!token) {
      console.log("No session token found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if we have an access token
    if (!token.accessToken) {
      console.error("No access token available");
      return NextResponse.json(
        { error: "No access token available", action: "reauthenticate" },
        { status: 401 }
      );
    }

    // Check if we have the Gmail scope
    if (token.scope && typeof token.scope === "string") {
      const hasGmailScope = token.scope.includes(GMAIL_SCOPE);
      console.log(`Token has Gmail scope: ${hasGmailScope ? "Yes" : "No"}`);

      if (!hasGmailScope) {
        console.error(`Gmail scope not found in token scopes: ${token.scope}`);
        return NextResponse.json(
          {
            error:
              "Gmail access not authorized. Please sign out and sign back in to grant permission.",
            action: "gmail-permission",
            requiredScope: GMAIL_SCOPE,
          },
          { status: 403 }
        );
      }

      console.log("Gmail scope verified in token");
    } else {
      console.error("No scope information in token");
      return NextResponse.json(
        {
          error:
            "Unable to verify Gmail permission. Please sign out and sign back in.",
          action: "reauthenticate",
        },
        { status: 403 }
      );
    }

    // Get max results parameter or default to 10
    const url = new URL(req.nextUrl.toString());
    const maxResults = parseInt(url.searchParams.get("max") || "10");
    console.log(`Fetching ${maxResults} emails from Gmail API`);

    try {
      // Fetch emails using Gmail API
      const emails = await fetchEmails(token.accessToken as string, maxResults);
      return NextResponse.json({ emails });
    } catch (fetchError: any) {
      console.error("Error fetching emails from Gmail API:", fetchError);

      // Handle specific Gmail API errors
      if (
        fetchError.message?.includes("invalid_grant") ||
        fetchError.message?.includes("token has been expired or revoked")
      ) {
        return NextResponse.json(
          {
            error:
              "Your Google access token has expired. Please sign out and sign back in.",
            action: "reauthenticate",
          },
          { status: 401 }
        );
      }

      // Handle permissions errors
      if (
        fetchError.message?.includes("permission") ||
        fetchError.message?.includes("scope") ||
        fetchError.message?.includes("forbidden") ||
        fetchError.message?.includes("403")
      ) {
        return NextResponse.json(
          {
            error:
              "Gmail access not authorized. Please sign out and sign back in to grant permission.",
            action: "gmail-permission",
          },
          { status: 403 }
        );
      }

      // Generic error
      return NextResponse.json(
        {
          error: `Error fetching emails: ${
            fetchError.message || "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in mail API route:", error);

    // Generic error handler - ensure we always return a proper JSON response
    return NextResponse.json(
      {
        error: `Error processing request: ${error.message || "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

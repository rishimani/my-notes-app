import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth"; // Import directly from lib/auth

export async function POST(request: Request) {
  try {
    // Get the session from the server
    const session = await getServerSession(authOptions);

    console.log(
      "Session in calendar API:",
      session ? "Session exists" : "No session"
    );

    // Log more details about the session
    if (session) {
      console.log("Session user:", session.user?.email);
      console.log("Access token exists:", session.accessToken ? "Yes" : "No");
      if (session.accessToken) {
        console.log("Access token length:", session.accessToken.length);
      }
      console.log("Scope:", session.scope);
    } else {
      console.log("No session found in API route");
    }

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated - No session" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check for token errors
    if (session.error) {
      return new NextResponse(
        JSON.stringify({
          error: "Authentication error",
          details:
            "Your Google authentication has expired. Please sign in again.",
          needsReauth: true,
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!session.accessToken) {
      return new NextResponse(
        JSON.stringify({
          error: "Not authenticated - No access token",
          needsReauth: true,
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body = await request.json();
    const { noteId } = body;

    // Get the note from the database
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return new NextResponse(JSON.stringify({ error: "Note not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (!note.reminderDate || !note.reminderTime) {
      return new NextResponse(
        JSON.stringify({ error: "Note does not have reminder date or time" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Set up Google Calendar API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL
        ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
        : "http://localhost:3000/api/auth/callback/google"
    );

    console.log(
      "Setting credentials with token length:",
      session.accessToken.length
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Create the event
    const reminderDateTime = `${note.reminderDate}T${note.reminderTime}:00`;

    // Parse the date and ensure it's in the correct format
    const startDateTime = new Date(
      `${note.reminderDate}T${note.reminderTime}:00`
    );

    // Make sure the date is valid
    if (isNaN(startDateTime.getTime())) {
      console.error("Invalid date/time format:", {
        reminderDate: note.reminderDate,
        reminderTime: note.reminderTime,
      });
      return new NextResponse(
        JSON.stringify({ error: "Invalid date or time format" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Calculate end time (1 hour later)
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    console.log("Event times:", {
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
    });

    const event = {
      summary: note.title,
      description: note.content,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "America/Los_Angeles",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "America/Los_Angeles",
      },
      reminders: {
        useDefault: true,
      },
    };

    try {
      // First, try to get the calendar list to verify permissions
      const calendarList = await calendar.calendarList.list();
      console.log("Successfully accessed calendar list");

      const result = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      console.log("Event created successfully:", result.data.htmlLink);

      return NextResponse.json({
        success: true,
        eventLink: result.data.htmlLink,
      });
    } catch (error: any) {
      console.error("Calendar API error:", error);

      // Log more details about the error
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);

        // Check for specific error types
        if (error.response.status === 403) {
          console.error("Permission denied. Check OAuth scopes and consent.");

          // If the user needs to re-authenticate
          return new NextResponse(
            JSON.stringify({
              error: "Calendar permission denied",
              details:
                "You need to re-authenticate with Google Calendar permissions",
              needsReauth: true,
            }),
            {
              status: 403,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      }

      return new NextResponse(
        JSON.stringify({
          error: "Failed to add to calendar",
          details: error?.message || "Unknown error",
          response: error.response?.data || null,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in calendar API:", error);

    // Check if error is related to authentication
    const isAuthError =
      error.message &&
      (error.message.includes("Invalid Credentials") ||
        error.message.includes("invalid_token") ||
        error.message.includes("invalid_grant") ||
        error.message.includes("token expired"));

    return new NextResponse(
      JSON.stringify({
        error: "Failed to add event to calendar",
        details: error.message || "Unknown error",
        needsReauth: isAuthError,
      }),
      {
        status: isAuthError ? 401 : 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

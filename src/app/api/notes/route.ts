import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);

    // If no session, return unauthorized
    if (!session || !session.user?.email) {
      console.log("Unauthorized attempt to fetch notes - No valid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(
      `GET /api/notes - Fetching notes for user: ${session.user.email}`
    );

    // Get the user from the database or create if not exists
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || null,
      },
    });

    // Fetch only notes belonging to the current user
    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log(`Found ${notes.length} notes for user ${user.id}`);
    return NextResponse.json(notes);
  } catch (error: any) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch notes",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);

    // If no session, return unauthorized
    if (!session || !session.user?.email) {
      console.log("Unauthorized attempt to create note - No valid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(
      `POST /api/notes - Creating a new note for user: ${session.user.email}`
    );

    // Get the user from the database or create if not exists
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || null,
      },
    });

    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.title || !body.content) {
      console.log("Validation failed: Missing title or content");
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    console.log("Creating note in database with data:", {
      title: body.title,
      content: body.content,
      userId: user.id,
      reminderDate: body.reminderDate,
      reminderTime: body.reminderTime,
    });

    const note = await prisma.note.create({
      data: {
        title: body.title,
        content: body.content,
        userId: user.id,
        reminderDate: body.reminderDate,
        reminderTime: body.reminderTime,
      },
    });

    console.log("Note created successfully:", note);
    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    console.error("Error creating note:", error);

    // Check if it's a Prisma error
    if (error.code) {
      console.error("Prisma error code:", error.code);
      console.error("Prisma error message:", error.message);

      // Handle specific Prisma errors
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A note with this title already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to create note",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

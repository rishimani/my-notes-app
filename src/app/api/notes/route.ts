import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("GET /api/notes - Fetching all notes");

    const notes = await prisma.note.findMany();

    console.log(`Found ${notes.length} notes`);
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
    console.log("POST /api/notes - Creating a new note");

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

    // Validate userId
    if (!body.userId) {
      console.log("Validation failed: Missing userId");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("Creating note in database with data:", {
      title: body.title,
      content: body.content,
      userId: body.userId,
      reminderDate: body.reminderDate,
      reminderTime: body.reminderTime,
    });

    const note = await prisma.note.create({
      data: {
        title: body.title,
        content: body.content,
        userId: body.userId,
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

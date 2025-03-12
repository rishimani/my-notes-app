import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper function to check if a note belongs to the current user
async function checkNoteOwnership(noteId: string, userEmail: string) {
  // Get the user from the database
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    return null;
  }

  // Check if the note exists and belongs to the user
  const note = await prisma.note.findUnique({
    where: {
      id: noteId,
    },
  });

  if (!note || note.userId !== user.id) {
    return null;
  }

  return { note, user };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/notes/${params.id} - Fetching note`);

    // Get the current user's session
    const session = await getServerSession(authOptions);

    // If no session, return unauthorized
    if (!session || !session.user?.email) {
      console.log("Unauthorized attempt to fetch note - No valid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the note belongs to the current user
    const result = await checkNoteOwnership(params.id, session.user.email);

    if (!result) {
      console.log(
        `Note with ID ${params.id} not found or doesn't belong to the current user`
      );
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(result.note);
  } catch (error: any) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch note",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`PUT /api/notes/${params.id} - Updating note`);

    // Get the current user's session
    const session = await getServerSession(authOptions);

    // If no session, return unauthorized
    if (!session || !session.user?.email) {
      console.log("Unauthorized attempt to update note - No valid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the note belongs to the current user
    const result = await checkNoteOwnership(params.id, session.user.email);

    if (!result) {
      console.log(
        `Note with ID ${params.id} not found or doesn't belong to the current user`
      );
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

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

    console.log("Updating note in database with data:", {
      title: body.title,
      content: body.content,
      reminderDate: body.reminderDate,
      reminderTime: body.reminderTime,
    });

    const note = await prisma.note.update({
      where: {
        id: params.id,
      },
      data: {
        title: body.title,
        content: body.content,
        reminderDate: body.reminderDate,
        reminderTime: body.reminderTime,
      },
    });

    console.log("Note updated successfully:", note);
    return NextResponse.json(note);
  } catch (error: any) {
    console.error("Error updating note:", error);

    // Check if it's a Prisma error
    if (error.code) {
      console.error("Prisma error code:", error.code);
      console.error("Prisma error message:", error.message);
      console.error("Prisma error meta:", error.meta);

      // Handle record not found error
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      {
        error: "Failed to update note",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`DELETE /api/notes/${params.id} - Deleting note`);

    // Get the current user's session
    const session = await getServerSession(authOptions);

    // If no session, return unauthorized
    if (!session || !session.user?.email) {
      console.log("Unauthorized attempt to delete note - No valid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the note belongs to the current user
    const result = await checkNoteOwnership(params.id, session.user.email);

    if (!result) {
      console.log(
        `Note with ID ${params.id} not found or doesn't belong to the current user`
      );
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({
      where: {
        id: params.id,
      },
    });

    console.log(`Note with ID ${params.id} deleted successfully`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting note:", error);

    // Check if it's a Prisma error
    if (error.code) {
      console.error("Prisma error code:", error.code);
      console.error("Prisma error message:", error.message);
      console.error("Prisma error meta:", error.meta);

      // Handle record not found error
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      {
        error: "Failed to delete note",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

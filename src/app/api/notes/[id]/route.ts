import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/notes/${params.id} - Fetching note`);

    const note = await prisma.note.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!note) {
      console.log(`Note with ID ${params.id} not found`);
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
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

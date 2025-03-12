import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Testing Prisma connection by creating a test note");

    const testNote = await prisma.note.create({
      data: {
        title: "Test Note",
        content:
          "This is a test note created to verify Prisma is working correctly",
        userId: "test-user",
      },
    });

    console.log("Test note created successfully:", testNote);

    return NextResponse.json({
      success: true,
      message: "Prisma test successful",
      note: testNote,
    });
  } catch (error: any) {
    console.error("Error testing Prisma:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to test Prisma",
        details: error.message || "Unknown error",
        code: error.code || "UNKNOWN",
      },
      { status: 500 }
    );
  }
}

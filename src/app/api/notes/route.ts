import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const notes = await prisma.note.findMany();
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const body = await request.json();
  const note = await prisma.note.create({
    data: {
      title: body.title,
      content: body.content,
      userId: body.userId || "anonymous", // In a real app, get this from authentication
    },
  });

  return NextResponse.json(note);
}

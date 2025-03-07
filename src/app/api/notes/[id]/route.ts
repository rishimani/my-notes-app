import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const note = await prisma.note.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!note) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json(note);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const note = await prisma.note.update({
    where: {
      id: params.id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  return NextResponse.json(note);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.note.delete({
    where: {
      id: params.id,
    },
  });

  return new NextResponse(null, { status: 204 });
}

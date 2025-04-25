import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const userSchema = z.object({
  expiresAt: z.string().datetime(),
  signerUuid: z.string(),
  publicKey: z.string(),
});

export async function GET(
  req: Request,
  { params }: { params: { fid: string } }
) {
  const fid = Number(params.fid);

  if (!fid) {
    return NextResponse.json({ error: "fid is required" }, { status: 400 });
  }

  try {
    const data = await prisma.user.findUnique({
      where: { fid: params.fid },
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { fid: string } }
) {
  try {
    const body = await request.json();
    const validatedData = userSchema.parse(body);

    const user = await prisma.user.create({
      data: {
        fid: params.fid,
        expiresAt: new Date(validatedData.expiresAt),
        signerUuid: validatedData.signerUuid,
        publicKey: validatedData.publicKey,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

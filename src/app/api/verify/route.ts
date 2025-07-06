import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { neynar } from "@/lib/neynar";

export async function GET(req: Request) {
  const fid = Number(req.headers.get("x-fid"));

  try {
    const data = await prisma.user.findUnique({
      where: { fid: fid.toString() },
    });

    if (!data) {
      return NextResponse.json({ verified: false }, { status: 200 });
    }

    const signer = await neynar.lookupSigner({ signerUuid: data.signerUuid });

    if (signer.status === "revoked") {
      await prisma.user.delete({
        where: { fid: fid.toString() },
      });

      return NextResponse.json({ verified: false }, { status: 200 });
    }

    return NextResponse.json({ verified: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { signerUuid, expiresAt, publicKey } = await request.json();
  const fid = Number(request.headers.get("x-fid"));

  try {
    const signer = await neynar.lookupSigner({ signerUuid });

    if (signer.status !== "approved" || signer.fid !== fid) {
      return NextResponse.json({ error: "Invalid signer" }, { status: 400 });
    }

    await prisma.user.create({
      data: {
        fid: fid.toString(),
        expiresAt: new Date(expiresAt),
        signerUuid,
        publicKey,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
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

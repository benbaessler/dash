import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { neynar } from "@/lib/neynar";
import { verify } from "@/utils/verify";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fid = searchParams.get("fid");

  if (!fid) {
    return NextResponse.json({ error: "fid is required" }, { status: 400 });
  }

  try {
    const data = await prisma.user.findUnique({
      where: { fid },
    });

    if (!data) {
      return NextResponse.json({ verified: false }, { status: 200 });
    }

    const signer = await neynar.lookupSigner({ signerUuid: data.signerUuid });

    if (signer.status === "revoked") {
      await prisma.user.delete({
        where: { fid },
      });

      return NextResponse.json({ verified: false }, { status: 200 });
    }

    return NextResponse.json({ verified: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

const userSchema = z.object({
  expiresAt: z.string().datetime(),
  signerUuid: z.string(),
  publicKey: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = userSchema.parse(body);

    const authHeader = request.headers.get("Authorization") as string;

    const payload = await verify(authHeader?.split(" ")[1]);

    const fid = payload.sub;

    const signer = await neynar.lookupSigner({ signerUuid: data.signerUuid });

    if (signer.status !== "approved" || signer.fid !== Number(fid)) {
      return NextResponse.json({ error: "Invalid signer" }, { status: 400 });
    }

    await prisma.user.create({
      data: {
        fid: fid.toString(),
        expiresAt: new Date(data.expiresAt),
        signerUuid: data.signerUuid,
        publicKey: data.publicKey,
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

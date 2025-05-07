import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/utils/auth";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { fid } = (await verifyToken(authHeader)) as { fid: number };
    const { castHash, text } = await request.json();

    if (!castHash || !text) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { fid: fid.toString() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await neynar.publishCast({
      signerUuid: user.signerUuid,
      text,
      parent: castHash
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to publish reply" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error publishing reply:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

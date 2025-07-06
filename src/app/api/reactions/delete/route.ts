import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import { ReactionType } from "@neynar/nodejs-sdk/build/api";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const fid = request.headers.get("x-fid");

    const { castHash, type } = await request.json();

    if (!castHash || !type || !fid) {
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

    const result = await neynar.deleteReaction({
      signerUuid: user.signerUuid,
      reactionType: type as ReactionType,
      target: castHash,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to delete reaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

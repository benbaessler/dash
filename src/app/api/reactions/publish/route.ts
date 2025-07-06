import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import { ReactionType } from "@neynar/nodejs-sdk/build/api";
import prisma from "@/lib/prisma";

// Valid reaction types
const VALID_REACTION_TYPES = ["like", "recast"] as const;
type ValidReactionType = (typeof VALID_REACTION_TYPES)[number];

export async function POST(request: Request) {
  const fid = Number(request.headers.get("x-fid"));
  const { castHash, type } = await request.json();
  
  if (!castHash || !type) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }
  
  try {
    // Validate reaction type
    if (!VALID_REACTION_TYPES.includes(type as ValidReactionType)) {
      return NextResponse.json(
        { error: "Invalid reaction type" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { fid: fid.toString() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await neynar.publishReaction({
      signerUuid: user.signerUuid,
      reactionType: type as ReactionType,
      target: castHash,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to publish reaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error publishing reaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

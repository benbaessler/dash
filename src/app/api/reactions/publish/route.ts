import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import { ReactionType } from "@neynar/nodejs-sdk/build/api";

export async function POST(request: Request) {
  try {
    const { castHash, type, signerUuid } = await request.json();

    if (!castHash || !type || !signerUuid) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const result = await neynar.publishReaction({
      signerUuid,
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

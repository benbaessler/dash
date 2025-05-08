import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/utils/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") || undefined;
  const hash = searchParams.get("hash") || undefined;

  if (!hash) {
    return NextResponse.json(
      { error: "castHash is required" },
      { status: 400 }
    );
  }

  try {
    const { conversation, next } = await neynar.lookupCastConversation({
      identifier: hash,
      type: "hash",
      limit: 15,
      fold: "above",
      sortType: "algorithmic",
      cursor,
    });

    // Filter out duplicate comments based on hash
    const comments = conversation.cast.direct_replies.filter(
      (reply, index, self) =>
        index === self.findIndex((r) => r.hash === reply.hash)
    );

    return NextResponse.json(
      { comments, cursor: next?.cursor },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

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
      parent: castHash,
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

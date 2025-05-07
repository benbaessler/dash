import { neynar } from "@/lib/neynar";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") || undefined;

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

import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import prisma from "@/lib/prisma";
import { verify } from "@/utils/verify";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization") as string;

    const payload = await verify(authHeader);
    const fid = payload.sub;

    const { fid: targetFid } = await request.json();

    if (!targetFid) {
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

    const result = await neynar.unfollowUser({
      signerUuid: user.signerUuid,
      targetFids: [targetFid],
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to unfollow user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

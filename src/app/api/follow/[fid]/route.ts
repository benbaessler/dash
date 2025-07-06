import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ fid: string }> }
) {
  const fid = Number(request.headers.get("x-fid"));
  const { fid: targetFid } = await params;

  if (!targetFid) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {

    const user = await prisma.user.findUnique({
      where: { fid: fid.toString() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await neynar.followUser({
      signerUuid: user.signerUuid,
      targetFids: [Number(targetFid)],
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to follow user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

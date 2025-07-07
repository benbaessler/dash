import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const fid = Number(req.headers.get("x-fid"));
  const { castHash, channelId, creatorFid } = await req.json();

  if (!castHash) {
    return NextResponse.json({ error: "Missing cast hash" }, { status: 400 });
  }

  try {
    const view = await prisma.view.upsert({
      where: {
        viewerFid_castHash: {
          viewerFid: fid.toString(),
          castHash,
        }
      },
      update: {},
      create: {
        viewerFid: fid.toString(),
        creatorFid: creatorFid.toString(),
        castHash,
        channelId,
      },
    });

    return NextResponse.json({ success: true, view });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}

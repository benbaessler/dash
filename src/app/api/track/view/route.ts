import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const fid = Number(req.headers.get("x-fid"));
  const { castHash, channelId } = await req.json();

  if (!castHash) {
    return NextResponse.json({ error: "Missing cast hash" }, { status: 400 });
  }

  try {
    const view = await prisma.view.upsert({
      where: {
        fid_castHash: {
          fid: fid.toString(),
          castHash,
        },
      },
      update: {},
      create: {
        fid: fid.toString(),
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

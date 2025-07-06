import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const fid = Number(req.headers.get("x-fid"));
  const { targetFid } = await req.json();

  if (!targetFid) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const share = await prisma.share.upsert({
      where: {
        senderFid_recipientFid: {
          senderFid: fid.toString(),
          recipientFid: targetFid,
        },
      },
      update: {},
      create: {
        senderFid: fid.toString(),
        recipientFid: targetFid.toString(),
      },
    });

    return NextResponse.json({ success: true, share });
  } catch (error) {
    console.error("Error tracking share:", error);
    return NextResponse.json(
      { error: "Failed to track share" },
      { status: 500 }
    );
  }
}

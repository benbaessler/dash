import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { senderFid, recipientFid } = await req.json();

    if (!senderFid || !recipientFid) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    try {
      const share = await prisma.share.upsert({
        where: {
          senderFid_recipientFid: {
            senderFid,
            recipientFid,
          },
        },
        update: {},
        create: {
          senderFid,
          recipientFid,
        },
      });

      return NextResponse.json({ success: true, share });
    } catch (error) {
      console.error("Error creating share:", error);
      return NextResponse.json(
        {
          error: "Failed to create share",
          details:
            "There might be an issue with the recipient FID or database constraints.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error tracking share:", error);
    return NextResponse.json(
      { error: "Failed to track share" },
      { status: 500 }
    );
  }
}

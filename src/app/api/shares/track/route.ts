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

    const sender = await prisma.user.findUnique({
      where: { fid: senderFid },
    });

    if (!sender) {
      return NextResponse.json(
        { 
          error: "Sender user not found in database", 
          details: "The sender user must be registered before sharing. Please contact support." 
        }, 
        { status: 404 }
      );
    }
    
    // Since we have a valid sender, we can proceed with the share
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
          details: "There might be an issue with the recipient FID or database constraints."
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

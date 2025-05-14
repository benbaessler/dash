import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { senderFid, recipientFid } = await req.json();

    if (!senderFid || !recipientFid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sender = await prisma.user.findUnique({
      where: { fid: senderFid }
    });

    const recipient = await prisma.user.findUnique({
      where: { fid: recipientFid }
    });

    if (!sender || !recipient) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }

    const share = await prisma.share.upsert({
      where: {
        senderFid_recipientFid: {
          senderFid,
          recipientFid
        }
      },
      update: {
        count: {
          increment: 1
        }
      },
      create: {
        senderFid,
        recipientFid,
        count: 1
      }
    });

    return NextResponse.json({ success: true, share });
  } catch (error) {
    console.error('Error tracking share:', error);
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 }
    );
  }
}
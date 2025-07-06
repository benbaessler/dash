import { NextRequest, NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import prisma from "@/lib/prisma";
import { Share } from "@/generated/prisma";
import { User } from "@neynar/nodejs-sdk/build/api/models/user";
export async function GET(request: NextRequest) {
  const fid = Number(request.headers.get("x-fid"));
  
  try {
    const shares = await prisma.share.findMany({
      where: {
        senderFid: fid.toString(),
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 15,
    });

    let users: User[] = [];
    if (shares.length > 0) {
      const { users: friends } = await neynar.fetchBulkUsers({
        fids: shares.map((share: Share) => Number(share.recipientFid)),
      });
      users = friends;
    }

    const { users: following } = await neynar.fetchUserFollowing({
      fid,
      sortType: "algorithmic",
      limit: 15,
    });

    users = [...users, ...following.map((user) => user.user!)].filter(
      (user, index, self) => index === self.findIndex((u) => u.fid === user.fid)
    );
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}

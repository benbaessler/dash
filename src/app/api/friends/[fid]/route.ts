import { NextRequest, NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import prisma from "@/lib/prisma";
import { Share } from "@/generated/prisma";
import { User } from "@neynar/nodejs-sdk/build/api/models/user";
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      fid: string;
    }>;
  }
) {
  const { fid } = await params;

  if (!Number(fid)) {
    return NextResponse.json({ error: "Missing FID" }, { status: 400 });
  }

  const shares = await prisma.share.findMany({
    where: {
      senderFid: fid,
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
    fid: Number(fid),
    sortType: "algorithmic",
    limit: 15,
  });

  users = [...users, ...following.map((user) => user.user!)].filter(
    (user, index, self) => index === self.findIndex((u) => u.fid === user.fid)
  );

  try {
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}

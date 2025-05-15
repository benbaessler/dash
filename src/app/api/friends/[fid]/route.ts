import { NextRequest, NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import prisma from "@/lib/prisma";

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

  const [{ users: friends }, { users: following }] = await Promise.all([
    neynar.fetchBulkUsers({
      fids: shares.map((share: any) => share.recipientFid),
    }),
    neynar.fetchUserFollowing({
      fid: Number(fid),
      sortType: "algorithmic",
      limit: 15,
    }),
  ]);

  const users = [...friends, ...following.map((user) => user.user!)]
    .filter((user, index, self) => 
      index === self.findIndex((u) => u.fid === user.fid)
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

import { NextRequest, NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";

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

  const { users } = await neynar.fetchUserFollowing({
    fid: Number(fid),
    sortType: "algorithmic",
    limit: 15,
  });

  try {
    return NextResponse.json(users.map((user) => user.user));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}

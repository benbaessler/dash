import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";

export async function GET(
  request: Request,
  { params }: { params: { fid: string } }
) {
  const fid = Number(params.fid);

  if (isNaN(fid)) {
    return NextResponse.json({ error: "Invalid FID" }, { status: 400 });
  }

  try {
    const response = await neynar.fetchBulkUsers({ fids: [fid] });
    const user = response.users[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user from Neynar:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

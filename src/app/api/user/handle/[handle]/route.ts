import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import { User } from "@neynar/nodejs-sdk/build/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const viewerFid = Number(request.headers.get("x-fid"));

  if (!handle || handle.length < 1) {
    return NextResponse.json({ error: "Invalid handle" }, { status: 400 });
  }

  try {
    const response = await neynar.searchUser({
      q: handle,
      limit: 1,
      viewerFid,
    });

    const user = response.result.users.find(
      (user: User) => user.username.toLowerCase() === handle.toLowerCase()
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user by username from Neynar:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

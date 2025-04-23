import { neynar } from "@/lib/neynar";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fid = Number(searchParams.get("fid"));

  if (!fid) {
    return NextResponse.json({ error: "fid is required" }, { status: 400 });
  }

  try {
    const user = await neynar.fetchBulkUsers({ fids: [fid] });

    return NextResponse.json(user.users[0], { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

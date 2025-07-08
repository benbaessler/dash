import { neynar } from "@/lib/neynar";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fid = Number(request.headers.get("x-fid"));
  const searchParams = url.searchParams;
  const query = searchParams.get("query");
  const limit = searchParams.get("limit");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await neynar.searchUser({
      q: query.trim(),
      viewerFid: fid,
      limit: limit ? Number(limit) : undefined,
    });

    return NextResponse.json(response.result.users);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}

import { neynar } from "@/lib/neynar";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const query = searchParams.get("query");
    const viewerFid = searchParams.get("viewerFid");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    if (!Number(viewerFid)) {
      return NextResponse.json(
        { error: "Viewer FID parameter is required" },
        { status: 400 }
      );
    }

    const response = await neynar.searchUser({
      q: query.trim(),
      viewerFid: Number(viewerFid),
    });

    return NextResponse.json(
      response.result.users.filter((user) => user.fid !== Number(viewerFid))
    );
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}

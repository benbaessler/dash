import { neynar } from "@/lib/neynar";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
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
    const response = await neynar.searchChannels({
      q: query.trim(),
      limit: limit ? Number(limit) : undefined,
    });

    return NextResponse.json(response.channels);
  } catch (error) {
    console.error("Error searching channels:", error);
    return NextResponse.json(
      { error: "Failed to search channels" },
      { status: 500 }
    );
  }
}

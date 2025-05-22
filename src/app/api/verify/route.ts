import { NextRequest, NextResponse } from "next/server";
import { appDomain } from "@/constants";
import { verify } from "@/utils/verify";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    if (!appDomain) throw new Error("App domain is not set");

    const payload = await verify(token);

    return NextResponse.json({ success: true, payload }, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error}` },
      { status: 500 }
    );
  }
}

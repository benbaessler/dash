import { NextResponse } from "next/server";
import { inviteToChannel, sendNeynarFrameNotification } from "@/lib/neynar";
import { verifyToken } from "@/utils/auth";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { fid } = (await verifyToken(authHeader)) as { fid: number };

    try {
      await inviteToChannel({ fid });
    } catch {}

    await sendNeynarFrameNotification({
      fid: Number(fid),
      title: "Thanks for adding Dash!",
      body: "Feel free to join the discussion in the /dash channel.",
      targetUrl: "https://warpcast.com/~/channel/dash",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding process" },
      { status: 500 }
    );
  }
}

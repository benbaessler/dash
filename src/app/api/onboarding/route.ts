import { NextResponse } from "next/server";
import { inviteToChannel, sendNeynarFrameNotification } from "@/lib/neynar";

export async function POST(request: Request) {
  try {
    const { fid } = await request.json();

    // Verify FID is provided
    if (!fid) {
      return NextResponse.json(
        { error: "Missing required FID parameter" },
        { status: 400 }
      );
    }

    // Execute both operations in parallel
    const [invited, notification] = await Promise.all([
      inviteToChannel({ fid: Number(fid) }),
      sendNeynarFrameNotification({
        fid: Number(fid),
        title: "Thanks for adding Dash!",
        body: "You've been invited to join the /dash channel, click to join.",
        targetUrl: "https://warpcast.com/~/channel/dash",
      }),
    ]);

    return NextResponse.json({ success: true, invited, notification });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding process" },
      { status: 500 }
    );
  }
}

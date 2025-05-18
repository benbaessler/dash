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

    try {
      await inviteToChannel({ fid: Number(fid) });
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

import { NextRequest, NextResponse } from "next/server";
import { inviteToChannel, sendNeynarFrameNotification } from "@/lib/neynar";
import { setOnce } from "@/lib/kv";

export async function POST(request: NextRequest) {
  const fid = Number(request.headers.get("x-fid"));

  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Only onboard each user once
    const isFirstTime = await setOnce(`onboarded:${fid}`);
    if (!isFirstTime) {
      return NextResponse.json({ success: true });
    }

    try {
      await inviteToChannel({ fid });
    } catch (error) {
      console.error("Error inviting to channel", error);
    }

    await sendNeynarFrameNotification({
      fid,
      title: "Thanks for adding Dash!",
      body: "Enjoy scrolling and exploring videos on Farcaster.",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error onboarding user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

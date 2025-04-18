import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  const { fid } = await params;

  if (!Number(fid)) {
    return NextResponse.json({ error: "Missing FID" }, { status: 400 });
  }

  try {
    const url = "https://api.mbd.xyz/v1/farcaster/casts/feed/for-you";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        // 'HTTP-Referer': 'https://dash.bnbs.dev',
        // 'X-Title': 'Dash',
        "content-type": "application/json",
        authorization: `Bearer ${process.env.MBD_API_KEY}`,
      },
      body: JSON.stringify({
        filters: { languages: ["en"], publication_types: ["video"] },
        user_id: fid.toString(),
        feed_id: "feed_466",
      }),
    });
    const data = await res.json();
    console.log(res.status);
    console.log(data);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}

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
    const url = "https://api.mbd.xyz/v2/farcaster/casts/feed/for-you";
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
        user_id: fid.toString(),
        feed_id: "feed_466",
        return_metadata: true,
      }),
    });
    const data = await res.json();
    const posts: Post[] = data.body.map((item: any) => {
      return {
        id: item.item_id,
        text: item.metadata.text,
        video_url: item.metadata.embed_items[0],
        likeCount: item.metadata.likes_count,
        recastCount: item.metadata.shares_count,
        author: {
          fid: item.metadata.author.user_id,
          displayName: item.metadata.author.display_name,
          username: item.metadata.author.username,
          pfpUrl: item.metadata.author.pfp_url,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}

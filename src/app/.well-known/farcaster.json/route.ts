import { NextResponse } from 'next/server';

interface FrameMetadata {
  accountAssociation?: {
    header: string;
    payload: string;
    signature: string;
  };
  frame: {
    version: string;
    name: string;
    iconUrl: string;
    homeUrl: string;
    castShareUrl: string;
    imageUrl: string;
    buttonTitle: string;
    splashImageUrl: string;
    splashBackgroundColor: string;
    webhookUrl: string;
    subtitle: string;
    description: string;
    screenshotUrls: string[];
    primaryCategory: string;
    heroImageUrl: string;
    tags: string[];
    tagline: string;
    ogTitle: string;
    ogDescription: string;
    ogImageUrl: string;
  };
}

function getAccountAssociation() {
  const header = process.env.ACCOUNT_ASSOCIATION_HEADER;
  const payload = process.env.ACCOUNT_ASSOCIATION_PAYLOAD;
  const signature = process.env.ACCOUNT_ASSOCIATION_SIGNATURE;

  if (!header || !payload || !signature) {
    console.warn(
      "Account association env vars not set -- serving unsigned manifest"
    );
    return undefined;
  }

  return { header, payload, signature };
}

export async function getFarcasterMetadata(): Promise<FrameMetadata> {
  // First check for FRAME_METADATA in .env and use that if it exists
  if (process.env.FRAME_METADATA) {
    try {
      const metadata = JSON.parse(process.env.FRAME_METADATA);
      console.log("Using pre-signed frame metadata from environment");
      return metadata;
    } catch (error) {
      console.warn("Failed to parse FRAME_METADATA from environment:", error);
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_URL;
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_URL not configured");
  }

  // Determine webhook URL based on whether Neynar is enabled
  const neynarApiKey = process.env.NEYNAR_API_KEY;
  const neynarClientId = process.env.NEYNAR_CLIENT_ID;
  const webhookUrl =
    neynarApiKey && neynarClientId
      ? `https://api.neynar.com/f/app/${neynarClientId}/event`
      : `${appUrl}/api/webhook`;

  return {
    accountAssociation: getAccountAssociation(),
    frame: {
      version: "1",
      name: "Dash",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      castShareUrl: `${appUrl}/v`,
      imageUrl: `${appUrl}/opengraph-image.png`,
      buttonTitle: "Launch 📲",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#000000",
      webhookUrl,
      subtitle: "Explore videos on Farcaster",
      description:
        "A Farcaster client as a mini app, tailored for short-form video content.",
      screenshotUrls: [
        `${appUrl}/screenshots/1.png`,
        `${appUrl}/screenshots/2.png`,
        `${appUrl}/screenshots/3.png`,
      ],
      primaryCategory: "entertainment",
      heroImageUrl: `${appUrl}/hero.png`,
      tags: ["video", "watch", "tiktok", "reels", "shorts"],
      tagline: "Watch. Scroll. Repeat.",
      ogTitle: "Dash",
      ogDescription: "Explore videos on Farcaster",
      ogImageUrl: `${appUrl}/hero.png`,
    },
  };
}


export async function GET() {
  try {
    const config = await getFarcasterMetadata();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error generating metadata:', error);
    return NextResponse.json(
      { error: "Failed to generate manifest" },
      { status: 500 }
    );
  }
}

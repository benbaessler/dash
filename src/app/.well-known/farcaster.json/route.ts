import { NextResponse } from 'next/server';
import { mnemonicToAccount } from "viem/accounts";

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

export function getSecretEnvVars() {
  const seedPhrase = process.env.SEED_PHRASE;
  const fid = process.env.FID;

  if (!seedPhrase || !fid) {
    return null;
  }

  return { seedPhrase, fid };
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

  // Get the domain from the URL (without https:// prefix)
  const domain = new URL(appUrl).hostname;
  console.log("Using domain for manifest:", domain);

  const secretEnvVars = getSecretEnvVars();
  if (!secretEnvVars) {
    console.warn(
      "No seed phrase or FID found in environment variables -- generating unsigned metadata"
    );
  }

  let accountAssociation;
  if (secretEnvVars) {
    // Generate account from seed phrase
    const account = mnemonicToAccount(secretEnvVars.seedPhrase);
    const custodyAddress = account.address;

    const header = {
      fid: parseInt(secretEnvVars.fid),
      type: "custody",
      key: custodyAddress,
    };
    const encodedHeader = Buffer.from(JSON.stringify(header), "utf-8").toString(
      "base64"
    );

    const payload = {
      domain,
    };
    const encodedPayload = Buffer.from(
      JSON.stringify(payload),
      "utf-8"
    ).toString("base64url");

    const signature = await account.signMessage({
      message: `${encodedHeader}.${encodedPayload}`,
    });
    const encodedSignature = Buffer.from(signature, "utf-8").toString(
      "base64url"
    );

    accountAssociation = {
      header: encodedHeader,
      payload: encodedPayload,
      signature: encodedSignature,
    };
  }

  // Determine webhook URL based on whether Neynar is enabled
  const neynarApiKey = process.env.NEYNAR_API_KEY;
  const neynarClientId = process.env.NEYNAR_CLIENT_ID;
  const webhookUrl =
    neynarApiKey && neynarClientId
      ? `https://api.neynar.com/f/app/${neynarClientId}/event`
      : `${appUrl}/api/webhook`;

  return {
    accountAssociation: {
      header:
        "eyJmaWQiOjE5MTI5NCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDExNEQzYzE3MzMyNWNmYTQ1MDY1MDllZmYyQzJBNUFFY2NFODI0M2UifQ",
      payload: "eyJkb21haW4iOiJkYXNoLmJuYnMuZGV2In0",
      signature:
        "MHg4MTJjMTFiZTQ1NDVkZjU0ZWZhMzFhYzVjOGI2YWE3YzM3MzM1NGQzY2NmYjRlNTA0NjI0YzcxNzEzYTk5OTU1MzJhM2M0NTY1MWU1ZGMyNmMwYjBkYjJiMDYxYWRlOGQ5ZDAxY2ZmMjg2YTBkNGY4ZGRiNmU0OGVmYzM3YzgyMzFi",
    },
    frame: {
      version: "1",
      name: "Dash",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

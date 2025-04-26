import { NextRequest, NextResponse } from "next/server";
import { createAppClient, viemConnector } from "@farcaster/auth-client";
import { SignJWT } from "jose";
import { authSecret, authUrl } from "@/constants";

export async function POST(request: NextRequest) {
  if (!authUrl) throw new Error("Missing domain");

  try {
    const body = await request.json();
    const { message, signature, nonce } = body;

    if (!message || !signature || !nonce) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const appClient = createAppClient({
      ethereum: viemConnector(),
    });

    const domain = new URL(authUrl!).hostname;

    const verifyResponse = await appClient.verifySignInMessage({
      message,
      signature,
      domain,
      nonce,
    });

    if (!verifyResponse.success) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const fid = verifyResponse.fid;

    const secretKey = new TextEncoder().encode(authSecret);
    const payload = {
      fid: fid.toString(),
      sub: fid.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
    };

    const sessionJwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secretKey);

    return NextResponse.json(
      { success: true, fid: fid, token: sessionJwt },
      { status: 200 }
    );
  } catch (error) {
    console.error("Frame Sign-In: Error processing request:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error}` },
      { status: 500 }
    );
  }
}

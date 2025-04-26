import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import { ReactionType } from "@neynar/nodejs-sdk/build/api";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { authSecret } from "@/constants";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid Authorization header." },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    let payload;
    const secretKey = new TextEncoder().encode(authSecret);

    try {
      const { payload: verifiedPayload } = await jwtVerify(token, secretKey, {
        algorithms: ["HS256"],
      });
      payload = verifiedPayload;
    } catch (err) {
      console.error("JWT Verification Error:", err);
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired token." },
        { status: 401 }
      );
    }
    const fid = Number(payload.fid);

    const { castHash, type } = await request.json();

    if (!castHash || !type || !fid) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { fid: fid.toString() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await neynar.deleteReaction({
      signerUuid: user.signerUuid,
      reactionType: type as ReactionType,
      target: castHash,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to delete reaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { authSecret } from "@/constants";
import { jwtVerify } from "jose";

export async function verifyToken(
  authHeader: string | null
): Promise<{ fid: number } | NextResponse> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid Authorization header." },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  const secretKey = new TextEncoder().encode(authSecret);

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (typeof payload.fid !== 'number' && typeof payload.fid !== 'string') {
        console.error("JWT Payload FID Error: FID is missing or not a number/string", payload);
        return NextResponse.json(
            { error: "Unauthorized: Invalid token payload." },
            { status: 401 }
        );
    }
    const fid = Number(payload.fid);
    if (isNaN(fid)) {
        console.error("JWT Payload FID Error: FID is NaN after conversion", payload);
        return NextResponse.json(
            { error: "Unauthorized: Invalid token payload (FID is NaN)." },
            { status: 401 }
        );
    }
    return { fid };
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return NextResponse.json(
      { error: "Unauthorized: Invalid or expired token." },
      { status: 401 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { appDomain, appUrl } from "./constants";
import { createClient } from "@farcaster/quick-auth";

const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const config = {
  matcher: ["/api/:path*"],
};

const client = createClient();

// Route handlers trust `x-fid` as the authenticated user. It must only ever be
// set here, after the JWT is verified, so strip any client-supplied value.
const stripFid = (request: NextRequest) => {
  const headers = new Headers(request.headers);
  headers.delete("x-fid");
  return headers;
};

const unauthorized = () =>
  NextResponse.json(
    { status: "error", message: "Unauthorized" },
    { status: 401 }
  );

export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const headers = stripFid(request);

  // OG images are fetched by Farcaster clients without a session
  if (pathname.startsWith("/api/og/")) {
    return NextResponse.next({ request: { headers } });
  }

  const origin = request.headers.get("origin") ?? "";
  const isAllowedOrigin = origin === appUrl;

  // Handle preflighted requests
  if (request.method === "OPTIONS") {
    const preflightHeaders = {
      ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return unauthorized();

  const authToken = authHeader.slice("Bearer ".length);
  if (!authToken) return unauthorized();

  if (!appDomain) {
    console.error("[Middleware]: NEXT_PUBLIC_DOMAIN is not set");
    return NextResponse.json(
      { status: "error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }

  try {
    const payload = await client.verifyJwt({
      token: authToken,
      domain: appDomain,
    });

    if (!payload || !payload.sub) return unauthorized();

    headers.set("x-fid", String(payload.sub));
  } catch (error) {
    console.error("[Middleware]:", error);
    return unauthorized();
  }

  const response = NextResponse.next({ request: { headers } });

  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};

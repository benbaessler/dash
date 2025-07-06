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

export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Allow access to static files and OG images
  if (
    pathname.startsWith("/img/") ||
    pathname.startsWith("/api/og/") ||
    pathname.startsWith("/api/public") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".svg")
  ) {
    return NextResponse.next();
  }

  try {
    const origin = request.headers.get("origin") ?? "";
    const isAllowedOrigin = origin === appUrl;

    // Handle preflighted requests
    const isPreflight = request.method === "OPTIONS";

    if (isPreflight) {
      const preflightHeaders = {
        ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
        ...corsOptions,
      };
      return NextResponse.json({}, { headers: preflightHeaders });
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const authToken = authHeader.replace("Bearer ", "");
    if (!authToken) throw new Error("Invalid authorization format");
    
    if (!appDomain) throw new Error("App domain is not set");

    const payload = await client.verifyJwt({
      token: authToken,
      domain: appDomain,
    });

    if (!payload || payload.sub === 0) throw new Error("Not authorized");

    const headers = new Headers(request.headers);
    headers.set("x-fid", String(payload.sub));

    const updatedRequest = new NextRequest(request.url, {
      method: request.method,
      headers,
      body: request.body,
    });

    // Handle simple requests
    const response = NextResponse.next({
      request: updatedRequest,
    });

    if (isAllowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }

    Object.entries(corsOptions).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error("[Middleware]:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        message: `An unexpected error occurred`,
      },
      { status: 500 }
    );
  }
};

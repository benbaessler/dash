/** @jsxImportSource frog/jsx */
import { neynar } from "@/lib/neynar";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { loadGoogleFont } from "@/app/api/og/methods";
import { ProfileResponse } from "../../_components/profile";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  if (!username) notFound();

  const { user } = await neynar.lookupUserByUsername({
    username,
  });

  if (!user) notFound();

  return new ImageResponse(
    (<ProfileResponse type="user" data={user} />) as unknown as JSX.Element,
    {
      width: 1200,
      height: 800,
      fonts: [
        {
          name: "Inter",
          data: await loadGoogleFont("Inter", 400),
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: await loadGoogleFont("Inter", 700),
          style: "normal",
          weight: 700,
        },
      ],
      headers: {
        "cache-control":
          "max-age=14400,must-revalidate,public,no-transform,immutable",
      },
    }
  );
}

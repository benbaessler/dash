/** @jsxImportSource frog/jsx */
import { neynar } from "@/lib/neynar";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { Box, VStack, Image, HStack, Text } from "@/app/api/og/ui";
import { loadGoogleFont } from "@/app/api/og/methods";
import { ProfileResponse } from "../../_components/profile";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) notFound();

  const { channel } = await neynar.lookupChannel({
    id,
  });

  if (!channel) notFound();

  return new ImageResponse(
    (<ProfileResponse type="channel" data={channel} />) as unknown as JSX.Element,
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

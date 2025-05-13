/** @jsxImportSource frog/jsx */
import { neynar } from "@/lib/neynar";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { Box, HStack, VStack, Text, Image } from "@/app/api/og/ui";
import { loadGoogleFont } from "@/app/api/og/methods";
import { appUrl } from "@/constants";
import { truncateText } from "@/utils/truncate";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;

  if (!hash) notFound();

  const { cast } = await neynar.lookupCastByHashOrWarpcastUrl({
    identifier: hash,
    type: "hash",
  });

  if (!cast) notFound();

  const isVideo = cast.embeds.some(
    (embed: any) => embed.metadata.content_type === "application/x-mpegurl"
  );

  console.log({ isVideo, cast });

  if (!isVideo) notFound();

  return new ImageResponse(
    (
      <Box
        grow
        height="100%"
        width="100%"
        backgroundColor="background"
        display="flex"
        flexDirection="row"
      >
        <VStack display="flex" flex="1 0">
          <Box padding="32">
            <Image src={`${appUrl}/icons/dash.png`} width="22" height="22" />
          </Box>
          <Box
            display="flex"
            width="100%"
            grow
            justifyContent="center"
            padding="32"
          >
            <Text size="24" overflow="ellipsis" wrap="balance">
              {truncateText(cast.text, 100)}
            </Text>
          </Box>
          <HStack gap="10" display="flex" flexDirection="row" alignItems="center" padding="32">
            <Image
              src={cast.author.pfp_url ?? ""}
              width="46"
              height="46"
              borderRadius="256"
            />
            <VStack>
              <Text size="20" weight="700" overflow="ellipsis">
                {truncateText(cast.author.display_name ?? "", 20)}
              </Text>
              <Text size="18">@{truncateText(cast.author.username ?? "", 25)}</Text>
            </VStack>
          </HStack>
        </VStack>
        <Box display="flex" flex="1 0" backgroundColor="videoBg" grow>
          <Image
            // TODO: Replace with dynamic thumbnail - consider leaving out if it's too big
            src="https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/f0600888-36e4-4728-3ed5-4f4dd07b9200/original"
            objectFit="contain"
            height="100%"
            width="100%"
          />
        </Box>
      </Box>
    ) as unknown as JSX.Element,
    {
      width: 1200,
      height: 800,
      fonts: [
        {
          name: "DM Sans",
          data: await loadGoogleFont("DM Sans", 400),
          style: "normal",
          weight: 400,
        },
        {
          name: "DM Sans",
          data: await loadGoogleFont("DM Sans", 700),
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}

/** @jsxImportSource frog/jsx */
import { neynar } from "@/lib/neynar";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { Box, HStack, VStack, Text, Image, Icon } from "@/app/api/og/ui";
import { loadGoogleFont } from "@/app/api/og/methods";
import { truncateText } from "@/utils/truncate";
import { formatDuration } from "@/utils/formatTime";

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

  const videoEmbed: any = cast.embeds.find(
    (embed: any) =>
      embed.metadata && embed.metadata.content_type === "application/x-mpegurl"
  );

  if (!videoEmbed) notFound();

  return new ImageResponse(
    (
      <Box
        grow
        height="100%"
        width="100%"
        backgroundColor="background"
        display="flex"
        padding="24"
      >
        {/* <Box width="100%" alignItems="center">
          <Image src={`${appUrl}/icons/dash.png`} width="24" height="24" />
        </Box> */}
        <Box
          display="flex"
          width="100%"
          grow
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Text size="24" overflow="ellipsis" wrap>
            {truncateText(cast.text, 200)}
          </Text>
        </Box>
        <HStack
          width="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <HStack
            gap="10"
            display="flex"
            flexDirection="row"
            alignItems="center"
          >
            <Image
              src={cast.author.pfp_url ?? ""}
              width="46"
              height="46"
              borderRadius="256"
              objectFit="cover"
            />

            <VStack>
              <Text size="20" weight="700" overflow="ellipsis">
                {cast.author.display_name}
              </Text>
              <Text size="18">@{cast.author.username}</Text>
            </VStack>
          </HStack>
          <HStack
            display="flex"
            alignItems="center"
            backgroundColor="secondaryBg"
            paddingTop="8"
            paddingBottom="8"
            paddingLeft="12"
            paddingRight="12"
            borderRadius="8"
            gap="6"
          >
            <Icon name="play-circle-solid" size="28" color="textSecondary" />
            <Text size="20" weight="700" color="textSecondary">
              {formatDuration(videoEmbed.metadata.video.duration_s)}
            </Text>
          </HStack>
        </HStack>
        {/* <Box display="flex" flex="1 0" backgroundColor="videoBg" grow>
          <Image
            // TODO: Replace with dynamic thumbnail - consider leaving out if it's too big
            src="https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/f0600888-36e4-4728-3ed5-4f4dd07b9200/original"
            objectFit="contain"
            height="100%"
            width="100%"
          />
        </Box> */}
      </Box>
    ) as unknown as JSX.Element,
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

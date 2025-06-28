/** @jsxImportSource frog/jsx */
import { neynar } from "@/lib/neynar";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { Box, VStack, Image, HStack, Text } from "@/app/api/og/ui";
import { loadGoogleFont } from "@/app/api/og/methods";
import { truncateText } from "@/utils/truncate";

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
    (
      <VStack
        grow
        height="100%"
        width="100%"
        backgroundColor="background"
        display="flex"
        padding="24"
      >
        <Box
          width="100%"
          height="24"
          justifyContent="center"
          alignItems="center"
          paddingTop="32"
          gap="4"
        >
          <Image src="https://i.imgur.com/vVpASFu.png" height="28" />
        </Box>
        <HStack
          grow
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          marginTop="48"
          marginBottom="52"
        >
          <Box flex={1} height="100%" alignItems="center" padding="10">
            <Box
              borderRadius="18"
              border="12px solid"
              borderColor="border"
              width="224"
              height="224"
            >
              <Image
                src={user.pfp_url ?? ""}
                borderRadius="12"
              />
            </Box>
          </Box>
          <VStack
            width="100%"
            height="100%"
            flex={1}
            paddingRight="12"
            paddingLeft="12"
            justifyContent="center"
            gap="2"
            // marginBottom="64"
          >
            {user.display_name && (
              <Text size="32" weight="700">
                {user.display_name}
              </Text>
            )}
            <Text size="24" weight="500">
              @{user.username}
            </Text>
            <Box marginTop="12" opacity={0.8}>
              <Text size="24" weight="400" wrap>
                {truncateText(user.profile.bio.text, 80)}
              </Text>
            </Box>
          </VStack>
        </HStack>
      </VStack>
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

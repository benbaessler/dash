/** @jsxImportSource frog/jsx */
import { Box, VStack, Image, HStack, Text } from "../ui";
import { User, Channel } from "@neynar/nodejs-sdk/build/api";
import { truncateText } from "@/utils/truncate";

interface Props {
  type: "user" | "channel";
  data: User | Channel;
}

export function ProfileResponse({ type, data }: Props) {
  const profileData = {
    headerImage:
      type === "user"
        ? "https://i.imgur.com/qSiQIU6.png"
        : "https://i.imgur.com/9WbVTpu.png",
    image:
      type === "user"
        ? (data as User).pfp_url ?? ""
        : (data as Channel).image_url ?? "",
    displayName:
      type === "user" ? (data as User).display_name : (data as Channel).name,
    username:
      type === "user"
        ? `@${(data as User).username}`
        : `/${(data as Channel).id}`,
    description:
      type === "user"
        ? (data as User).profile.bio.text
        : (data as Channel).description,
  };

  return (
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
        <Image src={profileData.headerImage} height="28" />
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
              src={profileData.image}
              borderRadius="12"
              objectFit="cover"
              width="100%"
              height="100%"
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
        >
          {profileData.displayName ? (
            <Text size="32" weight="700">
              {profileData.displayName}
            </Text>
          ) : null}
          <Text size="24" weight="500">
            {profileData.username}
          </Text>
          <Box marginTop="12" opacity={0.8} paddingRight="12">
            <Text size="24" weight="400" wrap overflow="clip" align="start">
              {truncateText(profileData.description ?? "", 80)}
            </Text>
          </Box>
        </VStack>
      </HStack>
    </VStack>
  );
}

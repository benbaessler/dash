import { appUrl, devSignerUuid } from "@/constants";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

const apiKey = process.env.NEYNAR_API_KEY;
if (!apiKey) {
  throw new Error("NEYNAR_API_KEY not configured");
}

const config = new Configuration({
  apiKey,
});

export const neynar = new NeynarAPIClient(config);

type SendFrameNotificationResult =
  | {
      state: "error";
      error: unknown;
    }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success" };

export const inviteToChannel = async ({ fid }: { fid: number }) => {
  if (!devSignerUuid) {
    throw new Error("DEV_SIGNER_UUID not configured");
  }

  const result = await neynar.inviteChannelMember({
    signerUuid: devSignerUuid,
    channelId: "dash",
    fid,
    role: "member",
  });

  return result;
};

export async function sendNeynarFrameNotification({
  fid,
  title,
  body,
  targetUrl,
}: {
  fid: number;
  title: string;
  body: string;
  targetUrl?: string;
}): Promise<SendFrameNotificationResult> {
  try {
    const targetFids = [fid];
    const notification = {
      title,
      body,
      target_url: targetUrl ?? appUrl!,
    };

    const result = await neynar.publishFrameNotifications({
      targetFids,
      notification,
    });

    if (result.notification_deliveries.length > 0) {
      return { state: "success" };
    } else if (result.notification_deliveries.length === 0) {
      return { state: "no_token" };
    } else {
      return { state: "error", error: result || "Unknown error" };
    }
  } catch (error) {
    return { state: "error", error };
  }
}

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

export async function sendNeynarFrameNotification({
  fid,
  title,
  body,
}: {
  fid: number;
  title: string;
  body: string;
}): Promise<SendFrameNotificationResult> {
  try {
    const targetFids = [fid];
    const notification = {
      title,
      body,
      target_url: process.env.NEXT_PUBLIC_URL!,
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

"use server";

import { sendNeynarFrameNotification } from "@/lib/neynar";

import { inviteToChannel } from "@/lib/neynar";

export const onboardUser = async (fid: number) => {
  try {
    await inviteToChannel({ fid });
  } catch {}

  try {
    await sendNeynarFrameNotification({
      fid: Number(fid),
      title: "Thanks for adding Dash!",
      body: "Enjoy scrolling and exploring videos on Farcaster."
    });
  } catch (error) {
    console.error(error);
  }
};

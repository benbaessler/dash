export const appUrl = process.env.NEXT_PUBLIC_URL;

export const appDomain = process.env.NEXT_PUBLIC_DOMAIN;

export const devSignerUuid = process.env.DEV_SIGNER_UUID;

export const backgroundColor = "#000000";

export const isDevelopment =
  process.env.VERCEL_ENV === "development" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "development";

// FID used to personalize the feed in local development
export const developmentFid =
  Number(process.env.NEXT_PUBLIC_DEV_FID) || 367782;

export const activeCampaign = "/science";
export const campaignUrl = "https://farcaster.xyz/patriciaxlee.eth/0x37bc8bcf";

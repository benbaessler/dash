export const appUrl = process.env.NEXT_PUBLIC_URL;

export const appDomain = process.env.NEXT_PUBLIC_DOMAIN;

export const authUrl = process.env.AUTH_URL;
export const authSecret = process.env.AUTH_SECRET;

export const devSignerUuid = process.env.DEV_SIGNER_UUID;

export const backgroundColor = "#000000";

export const isDevelopment =
  process.env.VERCEL_ENV === "development" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "development";

export const developmentFid = 367782;
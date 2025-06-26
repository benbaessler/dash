import { appDomain } from "@/constants";
import { createClient } from "@farcaster/quick-auth";

const client = createClient();

export const verify = async (token: string) => {
  if (!appDomain) throw new Error("App domain is not set");

  const payload = await client.verifyJwt({
    token: token.split(" ")[1],
    domain: appDomain,
  });
  return payload;
};

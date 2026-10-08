# Dash

A Farcaster mini app for short-form video. Scroll a personalized video feed, browse channel and profile feeds, and like, recast, comment and follow without leaving the app.

## Stack

- [Next.js 15](https://nextjs.org/) (App Router) + TypeScript + React
- [Neynar](https://neynar.com/) for Farcaster data and signers
- [mbd.xyz](https://mbd.xyz/) for the personalized feed
- [Prisma](https://www.prisma.io/) + PostgreSQL
- [Upstash Redis](https://upstash.com/) for rate limits and notification state (optional)
- [Vidstack](https://vidstack.io/) video player, TailwindCSS + shadcn/ui
- [PostHog](https://posthog.com/) analytics

## Getting started

Requirements: [Bun](https://bun.sh/), a PostgreSQL database, and a Neynar API key.

```bash
bun install
cp .env.example .env.local   # fill in the values
npx prisma migrate dev
bun run dev
```

The app runs inside a Farcaster client. To test it, expose your local server over HTTPS, for example with a tunnel. Then open it in the [mini app developer tools](https://farcaster.xyz/~/developers/mini-apps/preview).

## Environment variables

See [`.env.example`](.env.example) for the full list.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_URL`, `NEXT_PUBLIC_DOMAIN` | Public URL and domain of the app. Quick Auth tokens are verified against the domain. |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEYNAR_API_KEY`, `NEYNAR_CLIENT_ID` | Neynar API access and notification webhook |
| `FARCASTER_DEVELOPER_MNEMONIC` | App account used to sign and sponsor signer key requests |
| `DEV_SIGNER_UUID` | Signer of the account that invites new users to the channel |
| `MBD_API_KEY` | mbd.xyz feed API key |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis (optional, falls back to in-memory) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key |
| `ACCOUNT_ASSOCIATION_*` | Signed account association for `/.well-known/farcaster.json` |

## Deployment

The app is set up for [Vercel](https://vercel.com/) (`vercel.json` runs `prisma generate` before the build). Set the environment variables above in your project. Generate the account association for your own domain.

## Security

See [SECURITY.md](SECURITY.md) to report vulnerabilities.

## License

[MIT](LICENSE)

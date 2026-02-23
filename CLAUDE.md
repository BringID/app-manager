# BringID App Manager

Next.js 15 app for managing BringID apps on Base (mainnet) and Base Sepolia (testnet).

## Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Web3:** wagmi v2, viem, RainbowKit, ethers v6
- **Styling:** Tailwind CSS v4
- **BringID SDK:** `bringid` package (beta)
- **E2E:** Playwright (screenshots, video recording)

## Commands

- `npm run dev` — Start dev server on port 3000
- `npm run build` — Production build
- `npm run lint` — ESLint
- `node e2e/onchain-flow.mjs` — Run on-chain setup (register app, deploy scorer, set scores)
- `node e2e/take-screenshots.mjs` — Take all e2e screenshots (requires dev server + flow-results.json)
- `bash e2e/annotate-screenshots.sh` — Add red highlight annotations to screenshots (requires ImageMagick)
- `node e2e/record-video.mjs` — Record walkthrough video with step labels and click indicators

## Project Structure

- `src/app/` — Next.js app routes (apps, scores, demo)
- `src/components/` — Shared components (Header with NetworkSwitcher)
- `src/lib/contracts.ts` — Contract addresses and ABIs
- `src/app/providers.tsx` — Wagmi/RainbowKit provider config
- `docs/` — User-facing guides
- `e2e/` — Playwright scripts, screenshots, videos

## URL Parameters

- `?chainId=<id>` — Set the active network on page load. Supported values:
  - `8453` — Base (mainnet)
  - `84532` — Base Sepolia (testnet)
  - If a wallet is connected on a different chain, it will be prompted to switch.
  - Example: `https://app-manager.bringid.com/apps?chainId=84532`

## Contracts (Base Mainnet & Base Sepolia)

- CredentialRegistry: `0xbF9b2556e6Dd64D60E08E3669CeF2a4293e006db`
- DefaultScorer: `0x315044578dd9480Dd25427E4a4d94b0fc2Fa4f8C`
- ScorerFactory: `0xAa03996D720C162Fdff246E1D3CEecc792986750`

## Environment Variables

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — WalletConnect project ID
- `NEXT_PUBLIC_ALCHEMY_API_KEY` — Alchemy API key (used for Base and Base Sepolia RPCs)
- `E2E_PRIVATE_KEY` — Private key for e2e headless wallet (in .env.local, never committed)

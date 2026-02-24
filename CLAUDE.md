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

- Semaphore: `0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D`
- CredentialRegistry: `0x17a22f130d4e1c4ba5C20a679a5a29F227083A62`
- DefaultScorer: `0x6791B588dAdeb4323bc1C3d987130bC13cBe3625`
- ScorerFactory: `0x016bC46169533a8d3284c5D8DD590C91783C8C06`

## MCP Server (Semaphore)

Use the **Context7 MCP server** to get up-to-date Semaphore documentation in AI prompts.

```json
{
  "mcpServers": {
    "Context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

Append `use context7` to your prompt when asking about Semaphore (e.g., "create a new Semaphore identity in TypeScript. use context7").

## Environment Variables

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — WalletConnect project ID
- `NEXT_PUBLIC_ALCHEMY_API_KEY` — Alchemy API key (used for Base and Base Sepolia RPCs)
- `E2E_PRIVATE_KEY` — Private key for e2e headless wallet (in .env.local, never committed)

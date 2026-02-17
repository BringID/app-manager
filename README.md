# BringID App Manager

Web interface for registering BringID apps, deploying custom scorers, and managing credential scores on Base.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
```

## Features

- **My Apps** — View all apps registered by your wallet
- **Register App** — Register a new app on the CredentialRegistry with a configurable recovery timelock
- **App Settings** — View app status, scoring configuration, and manage admin recovery
- **Deploy Custom Scorer** — Deploy a custom scorer contract via the ScorerFactory
- **Manage Scores** — Set per-credential-group scores for your custom scorer
- **Score Explorer** — Browse all credential groups and their scores
- **Demo** — Test the BringID verification widget with your app

## URL Parameters

### `?chainId=<id>` — Network Selection

Append `?chainId=` to any page URL to set the active network:

| Value   | Network          |
|---------|------------------|
| `8453`  | Base (mainnet)   |
| `84532` | Base Sepolia     |

Examples:
- `https://app-manager.bringid.com/apps?chainId=84532` — Open My Apps on Base Sepolia
- `http://localhost:3000/apps/new?chainId=8453` — Open Register App on Base mainnet

If a wallet is already connected on a different chain, it will be prompted to switch networks.

## Supported Networks

- **Base** (mainnet) — Default network
- **Base Sepolia** (testnet) — Yellow "Testnet Mode" banner shown when selected

The network switcher in the header allows switching between networks at any time, even before connecting a wallet.

## Documentation

- [Guide: Creating an App & Setting a Custom Scorer](docs/guide-create-app-and-custom-scorer.md)
- [Video Walkthrough](e2e/videos/walkthrough.mp4)

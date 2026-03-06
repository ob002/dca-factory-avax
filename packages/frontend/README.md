# DCA Factory - Frontend

Next.js 16 frontend for DCA Factory on Avalanche. Built with React 19, TypeScript, RainbowKit, and Wagmi v2.

## Features

### Pages
- Dashboard (/) - Portfolio overview, vault status, protocol stats
- Vaults (/vaults) - Create vault, view all vaults
- Manage (/manage) - Pause/resume, update settings, vault details
- Analytics (/analytics) - Gas tracking, Retro9000 projections, grant readiness

### Components
- Wallet connection via RainbowKit
- Real-time blockchain data with Wagmi hooks
- Custom hooks for contract interactions
- Responsive dark theme design

## Tech Stack

- Next.js 16 - React framework with App Router
- React 19 - Latest React features
- TypeScript - Type safety
- RainbowKit - Wallet connection UI
- Wagmi v2 - React hooks for Ethereum
- Viem - TypeScript Ethereum library
- Recharts - Data visualization

## Setup

```bash
npm install
cp .env.local.example .env.local
# Add your NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

Get WalletConnect Project ID:
1. Go to https://cloud.walletconnect.com
2. Create new project
3. Copy Project ID

## Development

```bash
npm run dev
# Open http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── vaults/page.tsx       # Vault creation
│   ├── manage/page.tsx       # Vault management
│   ├── analytics/page.tsx    # Gas analytics
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── Navbar.tsx            # Navigation
├── hooks/
│   ├── useVault.ts           # Vault operations
│   ├── useVaultDetails.ts    # Vault status
│   └── useBurnTracker.ts     # Gas tracking
└── lib/
    ├── wagmi.ts              # Wagmi config
    ├── constants.ts          # Contract addresses
    └── abis/                 # Contract ABIs
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional (defaults to Fuji testnet)
NEXT_PUBLIC_CHAIN_ID=43113
```

## Contract Integration

Contracts are configured in `src/lib/constants.ts`:

```typescript
export const CONTRACTS = {
  DCAFactory: "0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c",
  ExecutionEngine: "0xC5F3786533939D240E84cF7529870474eF29f49B",
  BurnTracker: "0xF7DadA4FF5609DAE75dc53a41EBcC31e7FCd0482",
};
```

ABIs are in `src/lib/abis/` and auto-generated from compiled contracts.

## Design System

### Colors
- Background: #0A0A0A
- Cards: #111111
- Borders: #222222
- Accent: #E84142 (Avalanche red)
- Text: #F5F5F5
- Muted: #888888

### Typography
- Font: IBM Plex Mono (monospace)
- Technical, developer-focused aesthetic

## License

MIT

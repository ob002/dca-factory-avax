# DCA Factory on Avalanche

Automated Dollar Cost Averaging with Benqi yield integration and Retro9000 gas tracking.

![Avalanche](https://img.shields.io/badge/Avalanche-E84142?style=flat&logo=avalanche&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?style=flat&logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![Tests](https://img.shields.io/badge/Tests-34%20passing-22c55e?style=flat)
![Network](https://img.shields.io/badge/Network-Fuji%20Testnet-E84142?style=flat)

Automated protocol for recurring USDC to AVAX purchases on Avalanche. Each user deploys their own vault that buys AVAX automatically, earns yield via Benqi, and tracks gas for Retro9000 rewards.

## What is DCA Factory?

DCA Factory lets users automate recurring USDC to AVAX purchases on Avalanche. Each user deploys their own vault that:

- Buys AVAX automatically at a set frequency (hourly, daily, weekly)
- Earns yield by depositing purchased AVAX into Benqi (qiAVAX)
- Tracks gas on-chain via BurnTracker for Retro9000 grant eligibility
- Non-custodial - users own their vault, funds never touch a central contract

## Architecture

```
User
 |
 v
DCAFactory ---- creates ----> DCAVault (per user)
     |                            |
     |                            | holds qiAVAX
     v                            |
ExecutionEngine <----------------+
     |
     +--> Trader Joe LB Router (USDC -> WAVAX swap)
     +--> Benqi qiAVAX (WAVAX -> qiAVAX yield)
     +--> BurnTracker (gas tracking for Retro9000)
```

## Deployed Contracts - Fuji Testnet

| Contract | Address |
|----------|---------|
| DCAFactory | `0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c` |
| ExecutionEngine | `0xC5F3786533939D240E84cF7529870474eF29f49B` |
| BurnTracker | `0xF7DadA4FF5609DAE75dc53a41EBcC31e7FCd0482` |

View on [Snowtrace Testnet](https://testnet.snowtrace.io/address/0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c)

## Protocol Integrations

| Protocol | Purpose | Address |
|----------|---------|---------|
| Trader Joe LB Router | USDC to WAVAX swaps | `0x9A93a421b74F1c5755b83dD2C211614dC419C44b` |
| Benqi qiAVAX | AVAX yield (lending receipt) | `0x5C0401e81e6953A22C95311bc54060BDE84b1022` |
| USDC | Buy token | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |
| WAVAX | Intermediate token | `0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7` |

## Project Structure

```
dca-factory-avax/
├── packages/
│   ├── contracts/          # Hardhat smart contracts
│   │   ├── contracts/      # Solidity source files
│   │   ├── test/           # Unit + integration tests
│   │   └── ignition/       # Deployment modules
│   ├── frontend/           # Next.js frontend
│   │   └── src/
│   │       ├── app/        # Pages (Dashboard, Vaults, Analytics)
│   │       ├── hooks/      # wagmi contract hooks
│   │       └── lib/        # ABIs, constants, config
│   └── keeper/             # Automation service
└── README.md
```

## Getting Started

### Prerequisites

```bash
node >= 18
npm >= 9
```

### Install

```bash
git clone https://github.com/YOURUSERNAME/dca-factory-avax.git
cd dca-factory-avax

cd packages/contracts
npm install

cd ../frontend
npm install

cd ../keeper
npm install
```

### Environment Setup

```bash
# Contracts
cp packages/contracts/.env.example packages/contracts/.env
# Add your AVALANCHE_RPC_URL, FUJI_RPC_URL, and PRIVATE_KEY

# Frontend
cp packages/frontend/.env.local.example packages/frontend/.env.local
# Add your NEXT_PUBLIC_WALLETCONNECT_ID
```

### Run Tests

```bash
cd packages/contracts

# Unit tests (20 passing)
npx hardhat test test/DCAFactory.test.ts

# Integration tests (14 passing)
npx hardhat test test/integration/

# All tests
npx hardhat test
```

### Deploy to Fuji Testnet

```bash
cd packages/contracts
npx hardhat ignition deploy ignition/modules/DCAFactoryModule --network fuji

# Verify contracts
npx hardhat run scripts/verify-contracts.ts --network fuji
```

### Run Frontend

```bash
cd packages/frontend
npm run dev
# Open http://localhost:3000
```

### Run Keeper

```bash
cd packages/keeper
npm start
```

## Smart Contracts

**DCAFactory**
- Creates and tracks DCA vaults per user
- One vault per wallet address
- Triggers batch DCA executions
- Owner-controlled protocol settings

**DCAVault**
- Stores user DCA settings (buy amount, frequency)
- Tracks execution history and total invested
- Pause/resume functionality
- canExecute() timing check

**ExecutionEngine**
- Swaps USDC to WAVAX via Trader Joe LB Router
- Deposits WAVAX to Benqi for qiAVAX yield
- Slippage protection on all swaps
- Records gas usage to BurnTracker
- setFactory() one-time lock for security

**BurnTracker**
- Records gas consumed per user per transaction
- Powers Retro9000 grant eligibility tracking
- getMyStats() for frontend display
- recordUsage() callable only by owner (ExecutionEngine)

## Testing

```
Unit Tests:        20 passing
Integration Tests: 14 passing
Total:             34 passing
```

Tests cover:
- Vault creation and initialization
- Access control and ownership
- Timing and frequency logic
- Protocol interactions (Trader Joe, Benqi)
- Multi-user scenarios
- Gas accumulation tracking

## Retro9000

This protocol is built specifically to maximize Retro9000 grant eligibility.

Every DCA execution records gas on-chain via BurnTracker. Gas data is publicly verifiable on Snowtrace. Analytics dashboard shows real-time grant projection. Protocol designed for high execution frequency equals high gas score.

## Security

- ReentrancyGuard on all external functions
- SafeERC20 for all token transfers
- One-time setFactory() lock prevents hijacking
- onlyOwner on all admin functions
- Slippage protection on all swaps
- Zero-address checks in constructors

## Roadmap

- [x] Smart contract development
- [x] Unit and integration tests
- [x] Fuji testnet deployment
- [x] Frontend (Dashboard, Vaults, Analytics, Manage)
- [x] Keeper automation service
- [ ] Contract verification on Snowtrace
- [ ] First DCA execution
- [ ] Mainnet deployment
- [ ] Multi-token support (USDT, DAI)

## License

MIT

Built on Avalanche

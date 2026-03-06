# DCA Factory — Avalanche

> Automated Dollar Cost Averaging protocol on Avalanche. Buy AVAX automatically with USDC, earn yield via Benqi, track gas for Retro9000 rewards.

![Avalanche](https://img.shields.io/badge/Avalanche-E84142?style=flat&logo=avalanche&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?style=flat&logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![Tests](https://img.shields.io/badge/Tests-39%20passing-22c55e?style=flat)
![Fuji](https://img.shields.io/badge/Fuji-Live-E84142?style=flat)
![Mainnet](https://img.shields.io/badge/Mainnet-Coming%20Soon-888888?style=flat)

---

## What is DCA Factory?

DCA Factory lets users automate recurring USDC → AVAX purchases on Avalanche. Each user deploys their own vault that:

- **Buys AVAX** automatically at a set frequency (hourly, daily, weekly)
- **Earns yield** by depositing purchased AVAX into Benqi (qiAVAX)
- **Tracks gas** on-chain via BurnTracker for Retro9000 grant eligibility
- **Non-custodial** — users own their vault, funds never touch a central contract

---

## Architecture

\`\`\`
User
 │
 ▼
DCAFactory ──── creates ────► DCAVault (per user)
     │                            │
     │                            │ holds qiAVAX
     ▼                            │
ExecutionEngine ◄────────────────┘
     │
     ├──► Trader Joe LB Router (USDC → WAVAX swap)
     ├──► Benqi qiAVAX (WAVAX → qiAVAX yield)
     └──► BurnTracker (gas tracking for Retro9000)
\`\`\`

---

## Deployments

### Fuji Testnet (Chain ID: 43113) — LIVE

| Contract | Address |
|----------|---------|
| DCAFactory | \`0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c\` |
| ExecutionEngine | \`0xC5F3786533939D240E84cF7529870474eF29f49B\` |
| BurnTracker | \`0xF7DadA4FF5609DAE75dc53a41EBcC31e7FCd0482\` |

> View on [Fuji Snowtrace](https://testnet.snowtrace.io/address/0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c)

### Mainnet (Chain ID: 43114) — Coming Soon

| Contract | Address |
|----------|---------|
| DCAFactory | \`TBD — deploying soon\` |
| ExecutionEngine | \`TBD — deploying soon\` |
| BurnTracker | \`TBD — deploying soon\` |

> Mainnet deployment scheduled after Fuji testing is complete.

---

## Protocol Integrations

| Protocol | Purpose | Network | Address |
|----------|---------|---------|---------|
| Trader Joe LB Router | USDC → WAVAX swaps | Mainnet | \`0x9A93a421b74F1c5755b83dD2C211614dC419C44b\` |
| Benqi qiAVAX | AVAX yield (lending receipt) | Mainnet | \`0x5C0401e81e6953A22C95311bc54060BDE84b1022\` |
| USDC | Buy token | Mainnet | \`0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6\` |
| WAVAX | Intermediate token | Mainnet | \`0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7\` |

---

## Project Structure

\`\`\`
dca-factory-avax/
├── packages/
│   ├── contracts/          # Hardhat smart contracts
│   │   ├── contracts/      # Solidity source files
│   │   │   ├── DCAFactory.sol
│   │   │   ├── DCAVault.sol
│   │   │   ├── ExecutionEngine.sol
│   │   │   ├── BurnTracker.sol
│   │   │   ├── interfaces/
│   │   │   └── mocks/
│   │   ├── test/           # 39 passing tests
│   │   └── ignition/       # Deployment modules
│   └── frontend/           # Next.js 16 frontend
│       └── src/
│           ├── app/        # Dashboard, Vaults, Analytics
│           ├── hooks/      # useVault, useBurnTracker
│           └── lib/        # ABIs, constants, wagmi config
\`\`\`

---

## Getting Started

### Prerequisites
\`\`\`bash
node >= 18
npm >= 9
\`\`\`

### Install
\`\`\`bash
git clone https://github.com/YOURUSERNAME/dca-factory-avax.git
cd dca-factory-avax
cd packages/contracts && npm install
cd ../frontend && npm install
\`\`\`

### Environment Setup
\`\`\`bash
# Contracts
cd packages/contracts
cp .env.example .env
# Fill in: AVALANCHE_RPC_URL, FUJI_RPC_URL, PRIVATE_KEY, SNOWTRACE_API_KEY
\`\`\`

### Run Tests
\`\`\`bash
cd packages/contracts

# All tests
npx hardhat test

# Unit tests only (20 passing)
npx hardhat test test/DCAFactory.test.ts

# Integration tests (14 passing)
npx hardhat test test/integration/full-dca-flow.test.ts

# Fork tests — requires AVALANCHE_RPC_URL (5 passing)
npx hardhat test test/integration/trader-joe-fork.test.ts
\`\`\`

### Deploy
\`\`\`bash
# Fuji testnet
npx hardhat ignition deploy ignition/modules/DCAFactoryModule.js --network fuji

# Mainnet (requires real AVAX for gas)
npx hardhat ignition deploy ignition/modules/DCAFactoryModule.js --network avalanche
\`\`\`

### Run Frontend
\`\`\`bash
cd packages/frontend
npm run dev
# Open http://localhost:3000
# Connect MetaMask to Fuji testnet (Chain ID: 43113)
\`\`\`

---

## Test Results

\`\`\`
Unit Tests           20 passing  ← DCAFactory, access control, vault lifecycle
Integration Tests    14 passing  ← mock protocols, multi-user, gas tracking
Fork Tests            5 passing  ← real Avalanche mainnet fork
                    ──────────
Total               39 passing
\`\`\`

---

## Smart Contracts

### DCAFactory
- Creates and tracks DCA vaults per user (one vault per wallet)
- Triggers batch DCA executions across all vaults
- Owner-controlled protocol settings with access control

### DCAVault
- Stores user DCA settings (buy amount, frequency)
- Tracks execution history and total invested
- Pause/resume functionality
- \`canExecute()\` timing check enforces frequency

### ExecutionEngine
- Swaps USDC → WAVAX via Trader Joe LB Router
- Deposits WAVAX to Benqi for qiAVAX yield
- Slippage protection on all swaps (5% max)
- Records gas usage to BurnTracker after every execution

### BurnTracker
- Records gas consumed per user per transaction
- Powers Retro9000 grant eligibility tracking
- \`getMyStats()\` returns user gas totals for frontend
- \`recordUsage()\` callable only by ExecutionEngine

---

## Retro9000

This protocol is built specifically for Avalanche's Retro9000 grant program:

- Every DCA execution records gas on-chain via BurnTracker
- Gas data is publicly verifiable on Snowtrace
- Analytics dashboard shows real-time grant projection
- High execution frequency = high gas score = larger retroactive reward

---

## Security

- \`ReentrancyGuard\` on all external functions
- \`SafeERC20\` for all token transfers
- One-time \`setFactory()\` lock prevents post-deployment hijacking
- \`onlyOwner\` on all admin functions
- Slippage protection on all swaps
- Zero-address checks in all constructors
- Access control tested in unit test suite

---

## Roadmap

- [x] Smart contract development (4 contracts)
- [x] Interface extraction (Trader Joe, Benqi, Pyth)
- [x] Mock contracts for testing
- [x] Unit tests — 20/20 passing
- [x] Integration tests — 14/14 passing
- [x] Fork tests — 5/5 passing
- [x] Local deployment via Hardhat Ignition
- [x] Fuji testnet deployment
- [x] Frontend — Dashboard, Vaults, Analytics
- [x] GitHub repository
- [ ] Contract verification on Snowtrace
- [ ] Frontend hosted on Vercel
- [ ] Mainnet deployment
- [ ] Keeper automation (auto-execute DCA)
- [ ] Multi-token support (USDT, DAI → AVAX)

---

## License

MIT

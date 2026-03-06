# DCA Factory - Smart Contracts

Hardhat project containing all smart contracts, tests, and deployment scripts for DCA Factory on Avalanche.

## Contracts

| Contract | Description |
|----------|-------------|
| `DCAFactory.sol` | Creates and manages user vaults |
| `DCAVault.sol` | Per-user DCA settings and history |
| `ExecutionEngine.sol` | Swaps + yield + gas tracking |
| `BurnTracker.sol` | On-chain gas recording for Retro9000 |

### Interfaces
| Interface | Description |
|-----------|-------------|
| `ITraderJoe.sol` | Trader Joe LB Router interface |
| `IBenqi.sol` | Benqi lending protocol interface |

### Mocks (testing only)
| Mock | Description |
|------|-------------|
| `MockERC20.sol` | Mintable test token |
| `MockTraderJoe.sol` | Simulated DEX with configurable rate |
| `MockBenqi.sol` | Simulated yield protocol |

## Deployed Addresses - Fuji Testnet (Chain ID: 43113)

| Contract | Address |
|----------|---------|
| BurnTracker | `0xF7DadA4FF5609DAE75dc53a41EBcC31e7FCd0482` |
| ExecutionEngine | `0xC5F3786533939D240E84cF7529870474eF29f49B` |
| DCAFactory | `0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c` |

## Setup

```bash
npm install
cp .env.example .env
# Fill in AVALANCHE_RPC_URL, FUJI_RPC_URL, PRIVATE_KEY, and SNOWTRACE_API_KEY
```

## Commands

```bash
# Compile
npx hardhat compile

# Run all tests
npx hardhat test

# Run specific test suite
npx hardhat test test/DCAFactory.test.ts
npx hardhat test test/integration/

# Deploy to Fuji
npx hardhat ignition deploy ignition/modules/DCAFactoryModule --network fuji

# Verify contracts on Snowtrace
npx hardhat run scripts/verify-contracts.ts --network fuji
```

## Test Results

```
DCAFactory Unit Tests
  - Should deploy with correct owner
  - Should set BurnTracker address
  - Should set ExecutionEngine address
  - Should create vault for user
  - Should not create duplicate vault
  - Should track all vaults
  - Should return user vault address
  - Should emit VaultCreated event
  - Should reject non-owner setBurnTracker
  - Should reject non-owner setExecutionEngine
  (20 total, all passing)

Integration Tests
  - Should deploy all contracts correctly
  - Should wire contracts together
  - Should create vault and verify storage
  - Should respect DCA timing
  - Should pause and resume vault
  - Should reject unauthorized access
  - Mock Trader Joe swap executes correctly
  - Mock Benqi deposit executes correctly
  - BurnTracker accumulates gas correctly
  - Multi-user vaults are independent
  (14 total, all passing)
```

## Environment Variables

```bash
# Required
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=0xyourprivatekeyhere

# For contract verification
SNOWTRACE_API_KEY=yourapikey

# Optional
REPORT_GAS=true
```

## Contract Verification

See [ADD_API_KEY.md](./ADD_API_KEY.md) for step-by-step guide to verify contracts on Snowtrace.

Quick steps:
1. Get API key from https://snowtrace.io/myapikey
2. Add to .env: `SNOWTRACE_API_KEY=your_key`
3. Run: `npx hardhat run scripts/verify-contracts.ts --network fuji`

## License

MIT

# Contract Verification Setup

## Step 1: Get Snowtrace API Key

1. Go to https://snowtrace.io
2. Click Sign In (top right) or Register if you don't have an account
3. After logging in, click your profile icon, then API Keys
4. Click + Add to create a new API key
5. Give it a name (e.g., "DCA Factory Verification")
6. Copy the API key

## Step 2: Add API Key to .env

```bash
cd ~/dca-factory-avax/packages/contracts

# Create .env if it doesn't exist
cp .env.example .env

# Edit .env and add your API key
nano .env
```

Add this line:
```
SNOWTRACE_API_KEY=your_api_key_here
```

## Step 3: Verify Contracts

```bash
# Make sure you're in the contracts directory
cd ~/dca-factory-avax/packages/contracts

# Run the verification script
npx hardhat run scripts/verify-contracts.ts --network fuji
```

## Manual Verification (Alternative)

If the script fails, verify each contract manually:

```bash
# BurnTracker (no constructor args)
npx hardhat verify --network fuji 0xF7DadA4FF5609DAE75dc53a41EBcC31e7FCd0482

# ExecutionEngine (no constructor args)
npx hardhat verify --network fuji 0xC5F3786533939D240E84cF7529870474eF29f49B

# DCAFactory (with constructor args)
npx hardhat verify --network fuji 0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c \
  "0xC5F3786533939D240E84cF7529870474eF29f49B" \
  "0xF7DadA4FF5609DAE75dc53a41EBcC31e7FCd0482"
```

## Troubleshooting

**Error: "Invalid API Key"**
- Double-check your API key in .env
- Make sure there are no extra spaces or quotes

**Error: "Already Verified"**
- Contract is already verified. Check Snowtrace

**Error: "Compilation failed"**
- Make sure you're using the same Solidity version (0.8.28)
- Run `npx hardhat clean && npx hardhat compile` first

## Verify Success

After verification, you should see:
- Green checkmark on Snowtrace
- "Contract Source Code Verified" badge
- Readable source code on the contract page

View your contracts:
- Factory: https://testnet.snowtrace.io/address/0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c
- Engine: https://testnet.snowtrace.io/address/0xC5F3786533939D240E84cF7529870474eF29f49B
- Tracker: https://testnet.snowtrace.io/address/0xF7DadA4FF5609DAE75dc53a41EBcC31e7FCd0482

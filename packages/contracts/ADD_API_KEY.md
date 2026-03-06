# Add Snowtrace API Key

Simple steps to add your Snowtrace API key for contract verification.

## Step 1: Get Your API Key

1. Open browser: https://snowtrace.io
2. Click Sign In (top right) or Register
3. After login: Click your profile icon, then API Keys
4. Click + Add
5. Name it: dca-factory
6. Copy the API key

## Step 2: Add to .env File

Run this command (replace YOUR_KEY_HERE with your actual key):

```bash
echo "SNOWTRACE_API_KEY=YOUR_KEY_HERE" >> ~/dca-factory-avax/packages/contracts/.env
```

Example:
```bash
echo "SNOWTRACE_API_KEY=ABC123XYZ456" >> ~/dca-factory-avax/packages/contracts/.env
```

## Step 3: Verify It Was Added

```bash
cat ~/dca-factory-avax/packages/contracts/.env | grep SNOWTRACE
```

You should see:
```
SNOWTRACE_API_KEY=YOUR_KEY_HERE
```

## Step 4: Verify Contracts

```bash
cd ~/dca-factory-avax/packages/contracts
npx hardhat run scripts/verify-contracts.ts --network fuji
```

## Done

Check your contracts on Snowtrace:
- https://testnet.snowtrace.io/address/0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c
- https://testnet.snowtrace.io/address/0xC5F3786533939D240E84cF7529870474eF29f49B
- https://testnet.snowtrace.io/address/0xF7DadA4FF5609DAE75dc53a41EBcC31e7FCd0482

You should see green checkmarks indicating verified contracts.

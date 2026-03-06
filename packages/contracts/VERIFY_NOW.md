# Contract Verification - Ready to Use

## Quick Start (2 minutes)

### Step 1: Get API Key
Visit: https://snowtrace.io/myapikey
- Sign up (free)
- Click "+ Add" 
- Copy key

### Step 2: Add to .env
```bash
cd ~/dca-factory-avax/packages/contracts
bash scripts/setup-api-key.sh
```

### Step 3: Verify
```bash
npx hardhat run scripts/verify-contracts.ts --network fuji
```

Done. Check: https://testnet.snowtrace.io/address/0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c

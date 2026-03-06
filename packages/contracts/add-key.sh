#!/bin/bash
# Quick Add Snowtrace API Key

echo ""
echo "🔑 Get your API key from: https://snowtrace.io/myapikey"
echo ""
echo "Then run this command (replace YOUR_KEY with your actual key):"
echo ""
echo "  echo 'SNOWTRACE_API_KEY=YOUR_KEY' >> ~/dca-factory-avax/packages/contracts/.env"
echo ""
echo "Example:"
echo "  echo 'SNOWTRACE_API_KEY=ABC123XYZ' >> ~/dca-factory-avax/packages/contracts/.env"
echo ""
echo "After adding, verify contracts with:"
echo "  cd ~/dca-factory-avax/packages/contracts"
echo "  npx hardhat run scripts/verify-contracts.ts --network fuji"
echo ""

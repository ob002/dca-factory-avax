#!/bin/bash

echo "🔑 Snowtrace API Key Setup"
echo ""
echo "1. Visit: https://snowtrace.io/myapikey"
echo "2. Sign up/login (free)"
echo "3. Click '+ Add' to create new API key"
echo "4. Copy your API key"
echo ""
read -p "Paste your Snowtrace API key: " API_KEY

if [ -z "$API_KEY" ]; then
  echo "❌ No API key provided"
  exit 1
fi

cd "$(dirname "$0")/.."

if ! grep -q "SNOWTRACE_API_KEY" .env 2>/dev/null; then
  echo "" >> .env
  echo "SNOWTRACE_API_KEY=$API_KEY" >> .env
  echo "✅ Added SNOWTRACE_API_KEY to .env"
else
  sed -i.bak "s/SNOWTRACE_API_KEY=.*/SNOWTRACE_API_KEY=$API_KEY/" .env
  echo "✅ Updated SNOWTRACE_API_KEY in .env"
fi

echo ""
echo "✨ Ready to verify contracts!"
echo "Run: npx hardhat run scripts/verify-contracts.ts --network fuji"

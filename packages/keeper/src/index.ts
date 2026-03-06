/**
 * DCA Keeper - Automated vault execution service
 * Monitors vaults and triggers DCA when ready
 */

import { ethers } from "ethers";
import dotenv from "dotenv";
import { DCAKeeper } from "./DCAKeeper";

dotenv.config();

const config = {
  rpcUrl: process.env.RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
  privateKey: process.env.PRIVATE_KEY || "",
  checkIntervalMs: parseInt(process.env.CHECK_INTERVAL_MS || "300000"),
  factoryAddress: process.env.DCA_FACTORY_ADDRESS || "0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c",
  gasLimitMultiplier: parseFloat(process.env.GAS_LIMIT_MULTIPLIER || "1.2"),
  minAvaxBalance: parseFloat(process.env.MIN_AVAX_BALANCE || "0.5"),
};

async function main() {
  console.log("⬡ DCA Keeper Starting...");
  console.log("========================");
  console.log(`Network: ${config.rpcUrl}`);
  console.log(`Factory: ${config.factoryAddress}`);
  console.log(`Check Interval: ${config.checkIntervalMs / 1000}s\n");
  if (!config.privateKey) {
    console.error("❌ PRIVATE_KEY not set in environment");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const signer = new ethers.Wallet(config.privateKey, provider);
  const balance = await provider.getBalance(signer.address);
  const balanceInAvax = parseFloat(ethers.formatEther(balance));
  
  console.log(`Keeper Address: ${signer.address}`);
  console.log(`Balance: ${balanceInAvax.toFixed(4)} AVAX`);
  
  if (balanceInAvax < config.minAvaxBalance) {
    console.warn(`⚠️  Warning: Balance below minimum (${config.minAvaxBalance} AVAX)`);
    console.warn("   Keeper may not have enough gas for executions");
  }
  
  console.log("");

  const keeper = new DCAKeeper(signer, config.factoryAddress, config);
  
  console.log("✅ Keeper initialized");
  console.log("🕒 Starting monitoring loop...\n");
  await keeper.start();
}

process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down...");
  process.exit(0);
});
process.on("uncaughtException", (error) => {
  console.error("\n❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("\n❌ Unhandled rejection:", reason);
  process.exit(1);
});

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});

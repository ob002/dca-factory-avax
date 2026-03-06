import { run } from "hardhat";

const DEPLOYED_ADDRESSES = {
  DCAFactory: "0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c",
  ExecutionEngine: "0xC5F3786533939D240E84cF7529870474eF29f49B",
  BurnTracker: "0xF7DadA4FF5609DAE75dc53a41EBcC31e7FCd0482",
};

async function main() {
  console.log("🔍 Verifying contracts on Snowtrace...\n");

  console.log("Verifying BurnTracker...");
  try {
    await run("verify:verify", {
      address: DEPLOYED_ADDRESSES.BurnTracker,
      constructorArguments: [],
    });
    console.log("✅ BurnTracker verified\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ BurnTracker already verified\n");
    } else {
      console.error("❌ BurnTracker verification failed:", error.message, "\n");
    }
  }

  console.log("Verifying ExecutionEngine...");
  try {
    await run("verify:verify", {
      address: DEPLOYED_ADDRESSES.ExecutionEngine,
      constructorArguments: [],
    });
    console.log("✅ ExecutionEngine verified\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ ExecutionEngine already verified\n");
    } else {
      console.error("❌ ExecutionEngine verification failed:", error.message, "\n");
    }
  }

  console.log("Verifying DCAFactory...");
  try {
    await run("verify:verify", {
      address: DEPLOYED_ADDRESSES.DCAFactory,
      constructorArguments: [
        DEPLOYED_ADDRESSES.ExecutionEngine,
        DEPLOYED_ADDRESSES.BurnTracker,
      ],
    });
    console.log("✅ DCAFactory verified\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ DCAFactory already verified\n");
    } else {
      console.error("❌ DCAFactory verification failed:", error.message, "\n");
    }
  }

  console.log("✨ Verification complete!");
  console.log("View contracts at:");
  console.log(`  Factory: https://testnet.snowtrace.io/address/${DEPLOYED_ADDRESSES.DCAFactory}`);
  console.log(`  Engine:  https://testnet.snowtrace.io/address/${DEPLOYED_ADDRESSES.ExecutionEngine}`);
  console.log(`  Tracker: https://testnet.snowtrace.io/address/${DEPLOYED_ADDRESSES.BurnTracker}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// DCA Factory Deployment Module
//
// Correct deployment order:
//   1. BurnTracker        — no dependencies
//   2. ExecutionEngine    — needs BurnTracker address
//   3. DCAFactory         — no constructor dependencies
//   4. Wire up:
//        DCAFactory.setBurnTracker(burnTracker)
//        DCAFactory.setExecutionEngine(executionEngine)
//        ExecutionEngine.setFactory(dcaFactory)   ← FIX: point engine at factory

module.exports = buildModule("DCAFactoryModule", (m) => {

  // Step 1: Deploy BurnTracker
  // No dependencies — deploy first
  const burnTracker = m.contract("BurnTracker", [], {
    id: "BurnTracker",
  });

  // Step 2: Deploy ExecutionEngine
  // Needs BurnTracker address in constructor.
  // NOTE: ExecutionEngine sets factory = msg.sender (your wallet) here.
  //       We fix this in Step 4 by calling setFactory(dcaFactory).
  const executionEngine = m.contract("ExecutionEngine", [burnTracker], {
    id: "ExecutionEngine",
    after: [burnTracker], // FIX 1: explicit ordering — wait for BurnTracker
  });

  // Step 3: Deploy DCAFactory
  // No constructor args needed
  const dcaFactory = m.contract("DCAFactory", [], {
    id: "DCAFactory",
    after: [executionEngine], // FIX 2: wait for both above before deploying
  });

  // Step 4: Wire up dependencies
  // All three calls below must happen AFTER all contracts are deployed,
  // and in the right order (Ignition respects `after` chains).

  // 4a. Tell DCAFactory where BurnTracker is
  const setBurnTracker = m.call(dcaFactory, "setBurnTracker", [burnTracker], {
    id: "SetBurnTracker",
    after: [dcaFactory],
  });

  // 4b. Tell DCAFactory where ExecutionEngine is
  const setExecutionEngine = m.call(
    dcaFactory,
    "setExecutionEngine",
    [executionEngine],
    {
      id: "SetExecutionEngine",
      after: [setBurnTracker], // FIX 3: run sequentially, not in parallel
    }
  );

  // 4c. FIX 4: Tell ExecutionEngine that DCAFactory is its authorized caller.
  //     Without this, executionEngine.factory = your wallet address,
  //     so every call from DCAFactory hits "Only factory" and reverts.
  m.call(executionEngine, "setFactory", [dcaFactory], {
    id: "SetFactory",
    after: [setExecutionEngine], // FIX 5: run last — everything must exist first
  });

  // Return all deployed contracts 
  return { burnTracker, executionEngine, dcaFactory };
});
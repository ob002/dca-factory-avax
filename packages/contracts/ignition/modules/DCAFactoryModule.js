const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DCAFactoryModule", (m) => {

  const burnTracker = m.contract("BurnTracker", [], {
    id: "BurnTracker",
  });

  const executionEngine = m.contract("ExecutionEngine", [burnTracker], {
    id: "ExecutionEngine",
    after: [burnTracker],
  });

  const dcaFactory = m.contract("DCAFactory", [], {
    id: "DCAFactory",
    after: [executionEngine],
  });

  const setBurnTracker = m.call(dcaFactory, "setBurnTracker", [burnTracker], {
    id: "SetBurnTracker",
    after: [dcaFactory],
  });

  const setExecutionEngine = m.call(dcaFactory, "setExecutionEngine", [executionEngine], {
    id: "SetExecutionEngine",
    after: [setBurnTracker],
  });

  m.call(executionEngine, "setFactory", [dcaFactory], {
    id: "SetFactory",
    after: [setExecutionEngine],
  });

  return { burnTracker, executionEngine, dcaFactory };
});

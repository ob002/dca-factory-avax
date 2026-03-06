import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const avalancheRpc = process.env.AVALANCHE_RPC_URL?.trim();
if (!avalancheRpc) {
  console.warn("AVALANCHE_RPC_URL not set, using public RPC (rate limits may apply)");
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
            details: {
              yul: true,
              yulDetails: {
                stackAllocation: true,          // fixes "stack too deep"
                optimizerSteps: "dhfoDgvulfnTUtnIf",
              },
            },
          },
          viaIR: true,                          // required for ExecutionEngine
        },
      },
    ],
  },

  networks: {
    hardhat: {
      chainId: 43114,
      forking: {
        url: avalancheRpc || "https://api.avax.network/ext/bc/C/rpc",
        blockNumber: 79635154, // latest block minus 100
        enabled: true,
      },
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 43114,
    },
    avalanche: {
      url: avalancheRpc || "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    fuji: {
      url: process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },

  paths: {
    sources:   "./contracts",
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts",
  },

  mocha: {
    timeout: 120000, // 2 minutes for fork tests
    color: true,
  },

  etherscan: {
    apiKey: {
      avalanche: process.env.SNOWTRACE_API_KEY ?? "",
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY ?? "",
    },
    customChains: [
      {
        network: "avalancheFujiTestnet",
        chainId: 43113,
        urls: {
          apiURL: "https://api-testnet.snowtrace.io/api",
          browserURL: "https://testnet.snowtrace.io",
        },
      },
    ],
  },

  // Uncomment when ready to check gas costs
  // gasReporter: {
  //   enabled: process.env.REPORT_GAS === "true",
  //   currency: "USD",
  //   coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  // },
};

export default config;
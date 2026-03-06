export const CONTRACTS = {
  DCA_FACTORY:      "0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c",
  EXECUTION_ENGINE: "0xC5F3786533939D240E84cF7529870474eF29f49B",
  BURN_TRACKER:     "0xF7DadA4FF5609DAE75dc53a41EBcC31e7FCd0482",
} as const;

export const TOKENS = {
  USDC: {
    address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" as `0x${string}`,
    symbol: "USDC",
    decimals: 6,
  },
  WAVAX: {
    address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7" as `0x${string}`,
    symbol: "WAVAX",
    decimals: 18,
  },
} as const;

export const FREQUENCY_OPTIONS = [
  { label: "Every hour",    value: 3600   },
  { label: "Every 6 hours", value: 21600  },
  { label: "Daily",         value: 86400  },
  { label: "Weekly",        value: 604800 },
] as const;

// Network config
export const NETWORK = {
  chainId:  43113,
  name:     "Avalanche Fuji Testnet",
  rpc:      "https://api.avax-test.network/ext/bc/C/rpc",
  explorer: "https://testnet.snowtrace.io",
} as const;

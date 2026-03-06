"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/constants";
import BurnTrackerABI from "@/lib/abis/BurnTracker.json";

export function useBurnTracker() {
  const { address, isConnected } = useAccount();

  const { data: stats, isLoading } = useReadContract({
    address: CONTRACTS.BURN_TRACKER as `0x${string}`,
    abi: BurnTrackerABI,
    functionName: "getMyStats",
    query: {
      enabled: isConnected,
      staleTime: 30_000,
      gcTime: 60_000,
    },
  });

  const totalGasUsed      = (stats as any)?.totalGasUsed      ?? BigInt(0);
  const totalTransactions = (stats as any)?.totalTransactions ?? BigInt(0);

  return {
    totalGasUsed,
    totalTransactions,
    isLoading,
  };
}

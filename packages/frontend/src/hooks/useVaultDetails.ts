"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import DCAVaultABI from "@/lib/abis/DCAVault.json";

export function useVaultDetails(vaultAddress: string | undefined) {
  const enabled = Boolean(vaultAddress && vaultAddress !== "0x0000000000000000000000000000000000000000");

  const { data: status, refetch } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: DCAVaultABI,
    functionName: "getStatus",
    query: { enabled, refetchInterval: 10000 },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const pause = () => writeContract({
    address: vaultAddress as `0x${string}`,
    abi: DCAVaultABI,
    functionName: "pause",
  });

  const resume = () => writeContract({
    address: vaultAddress as `0x${string}`,
    abi: DCAVaultABI,
    functionName: "resume",
  });

  const updateSettings = (buyAmount: string, frequency: number) => writeContract({
    address: vaultAddress as `0x${string}`,
    abi: DCAVaultABI,
    functionName: "updateSettings",
    args: [BigInt(Number(buyAmount) * 1e6), BigInt(frequency)],
  });

  if (!status) return { status: null, pause, resume, updateSettings, isPending, isConfirming, isSuccess, refetch };

  const [buyAmount, frequency, lastExecution, nextExecution, totalInvested, executionCount, active, canExecute] = status as [bigint, bigint, bigint, bigint, bigint, bigint, boolean, boolean];

  return {
    status: {
      buyAmount: Number(buyAmount) / 1e6,
      frequency: Number(frequency),
      lastExecution: Number(lastExecution),
      nextExecution: Number(nextExecution),
      totalInvested: Number(totalInvested) / 1e6,
      executionCount: Number(executionCount),
      active,
      canExecute,
    },
    pause,
    resume,
    updateSettings,
    isPending,
    isConfirming,
    isSuccess,
    refetch,
  };
}

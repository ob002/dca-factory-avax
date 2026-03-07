"use client";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/lib/constants";
import DCAVaultABI from "@/lib/abis/DCAVault.json";
import { parseUnits } from "viem";

export function useVaultDetails(vaultAddress?: string) {
  const { data: statusData, refetch } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: DCAVaultABI,
    functionName: "getStatus",
    query: { enabled: !!vaultAddress },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const status = statusData ? {
    buyAmount: statusData[0],
    frequency: statusData[1],
    lastExecution: statusData[2],
    nextExecution: statusData[3],
    totalInvested: statusData[4],
    executionCount: statusData[5],
    active: statusData[6],
    canExecute: statusData[7],
  } : null;

  const pause = () => {
    if (!vaultAddress) return;
    writeContract({
      address: vaultAddress as `0x${string}`,
      abi: DCAVaultABI,
      functionName: "pause",
    });
  };

  const resume = () => {
    if (!vaultAddress) return;
    writeContract({
      address: vaultAddress as `0x${string}`,
      abi: DCAVaultABI,
      functionName: "resume",
    });
  };

  const updateSettings = (buyAmount: string, frequency: number) => {
    if (!vaultAddress) return;
    writeContract({
      address: vaultAddress as `0x${string}`,
      abi: DCAVaultABI,
      functionName: "updateSettings",
      args: [parseUnits(buyAmount, 6), BigInt(frequency)],
    });
  };

  return { status, pause, resume, updateSettings, isPending, isConfirming, isSuccess, refetch };
}

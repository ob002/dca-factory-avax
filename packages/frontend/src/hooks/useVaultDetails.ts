"use client";
import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/constants";
import DCAVaultABI from "@/lib/abis/DCAVault.json";

export function useVaultDetails(vaultAddress?: string) {
  const { data: canExecute } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: DCAVaultABI.abi,
    functionName: "canExecute",
    query: { enabled: !!vaultAddress },
  });
  return { canExecute: canExecute ?? false };
}

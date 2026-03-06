"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS } from "@/lib/constants";
import DCAFactoryABI from "@/lib/abis/DCAFactory.json";

export function useVault() {
  const { isConnected } = useAccount();

  // Read user's vault address
  const {
    data: vaultAddress,
    isLoading: vaultLoading,
    refetch: refetchVault,
  } = useReadContract({
    address: CONTRACTS.DCA_FACTORY as `0x${string}`,
    abi: DCAFactoryABI,
    functionName: "getMyVault",
    query: {
      enabled: isConnected,
      staleTime: 30_000,
      gcTime: 60_000,
    },
  });

  // Read all vaults
  const { 
    data: allVaults,
    refetch: refetchAllVaults
  } = useReadContract({
    address: CONTRACTS.DCA_FACTORY as `0x${string}`,
    abi: DCAFactoryABI,
    functionName: "getAllVaults",
    query: {
      enabled: isConnected,
      staleTime: 30_000,
      gcTime: 60_000,
    },
  });

  // Write — create vault
  const {
    writeContract,
    data: txHash,
    isPending: isCreating,
    error: createError,
  } = useWriteContract();

  // Wait for tx confirmation
  const { isLoading: isConfirming, isSuccess: isCreated } =
    useWaitForTransactionReceipt({ hash: txHash });

  function createVault(buyAmountUSDC: string, frequency: number) {
    const buyAmount = parseUnits(buyAmountUSDC, 6);
    writeContract({
      address: CONTRACTS.DCA_FACTORY as `0x${string}`,
      abi: DCAFactoryABI,
      functionName: "createVault",
      args: [buyAmount, BigInt(frequency)],
    });
  }

  return {
    vaultAddress,
    vaultLoading,
    allVaults,
    createVault,
    isCreating,
    isConfirming,
    isCreated,
    createError,
    refetchVault,
    refetchAllVaults,
  };
}

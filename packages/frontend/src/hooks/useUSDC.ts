"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS, TOKENS } from "@/lib/constants";
import USDC_ABI from "@/lib/abis/USDC.json";

/**
 * Hook for USDC approval flow
 * Handles checking allowance and approving DCAFactory to spend USDC
 */
export function useUSDC() {
  const { address, isConnected } = useAccount();

  // Read USDC balance
  const { data: balance, isLoading: balanceLoading } = useReadContract({
    address: TOKENS.USDC.address,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
      staleTime: 10_000,
      gcTime: 30_000,
    },
  });

  // Read allowance for DCAFactory
  const { data: allowance, isLoading: allowanceLoading, refetch: refetchAllowance } = useReadContract({
    address: TOKENS.USDC.address,
    abi: USDC_ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, CONTRACTS.DCA_FACTORY as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
      staleTime: 10_000,
      gcTime: 30_000,
    },
  });

  // Write - approve USDC
  const {
    writeContract: approveUSDC,
    data: approveTxHash,
    isPending: isApproving,
    error: approveError,
  } = useWriteContract();

  // Wait for approval confirmation
  const { isLoading: isConfirmingApproval, isSuccess: isApproved } =
    useWaitForTransactionReceipt({ hash: approveTxHash });

  // Write - infinite approve (optional, for better UX)
  const {
    writeContract: approveInfinite,
    data: infiniteTxHash,
    isPending: isApprovingInfinite,
  } = useWriteContract();

  const { isLoading: isConfirmingInfinite, isSuccess: isInfiniteApproved } =
    useWaitForTransactionReceipt({ hash: infiniteTxHash });

  /**
   * Approve specific amount of USDC for DCAFactory
   */
  function approve(amountUSDC: string) {
    if (!amountUSDC || Number(amountUSDC) <= 0) return;
    
    const amount = parseUnits(amountUSDC, TOKENS.USDC.decimals);
    approveUSDC({
      address: TOKENS.USDC.address,
      abi: USDC_ABI,
      functionName: "approve",
      args: [CONTRACTS.DCA_FACTORY as `0x${string}`, amount],
    });
  }

  /**
   * Approve infinite USDC (one-time approval)
   */
  function approveMax() {
    approveInfinite({
      address: TOKENS.USDC.address,
      abi: USDC_ABI,
      functionName: "approve",
      args: [CONTRACTS.DCA_FACTORY as `0x${string}`, BigInt(2 ** 256 - 1)],
    });
  }

  /**
   * Check if user has approved enough USDC
   */
  function hasApprovedEnough(requiredAmount: string): boolean {
    if (!allowance || !requiredAmount) return false;
    
    const required = parseUnits(requiredAmount, TOKENS.USDC.decimals);
    return allowance >= required;
  }

  // Format balance and allowance
  const formattedBalance = balance 
    ? Number(balance) / 10 ** TOKENS.USDC.decimals 
    : 0;
    
  const formattedAllowance = allowance 
    ? Number(allowance) / 10 ** TOKENS.USDC.decimals 
    : 0;

  return {
    // Balance
    balance,
    formattedBalance,
    balanceLoading,
    
    // Allowance
    allowance,
    formattedAllowance,
    allowanceLoading,
    refetchAllowance,
    
    // Approval
    approve,
    approveMax,
    isApproving,
    isConfirmingApproval,
    isApproved,
    approveError,
    
    // Infinite approval
    approveInfinite,
    isApprovingInfinite,
    isConfirmingInfinite,
    isInfiniteApproved,
    
    // Helpers
    hasApprovedEnough,
  };
}

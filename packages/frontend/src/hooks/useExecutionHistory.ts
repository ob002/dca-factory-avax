"use client";

import { useEffect, useState } from "react";
import { usePublicClient, useBlockNumber } from "wagmi";
import { CONTRACTS } from "@/lib/constants";
import DCAVaultABI from "@/lib/abis/DCAVault.json";
import { parseAbi } from "viem";

export interface ExecutionRecord {
  vaultAddress: string;
  timestamp: number;
  amountSpent: bigint;
  txHash: string;
  blockNumber: number;
}

/**
 * Hook to fetch DCA execution history from all vaults
 * Queries DCAExecuted events from all vault addresses
 */
export function useExecutionHistory(vaultAddresses?: string[]) {
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient({ chainId: 43113 });
  const { data: currentBlock } = useBlockNumber({ watch: true });

  useEffect(() => {
    async function fetchExecutions() {
      if (!publicClient || !vaultAddresses || vaultAddresses.length === 0) {
        setExecutions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const allExecutions: ExecutionRecord[] = [];

        // Fetch events from each vault
        for (const vaultAddress of vaultAddresses) {
          try {
            const events = await publicClient.getContractEvents({
              address: vaultAddress as `0x${string}`,
              abi: parseAbi(DCAVaultABI),
              eventName: "DCAExecuted",
              fromBlock: 0n,
              toBlock: "latest",
            });

            for (const event of events) {
              if (event.args.amountSpent !== undefined && event.args.timestamp !== undefined) {
                allExecutions.push({
                  vaultAddress,
                  timestamp: Number(event.args.timestamp),
                  amountSpent: event.args.amountSpent,
                  txHash: event.transactionHash,
                  blockNumber: Number(event.blockNumber),
                });
              }
            }
          } catch (err: any) {
            console.error(`Failed to fetch events for vault ${vaultAddress}:`, err.message);
          }
        }

        // Sort by timestamp (newest first)
        allExecutions.sort((a, b) => b.timestamp - a.timestamp);
        setExecutions(allExecutions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExecutions();
  }, [publicClient, vaultAddresses, currentBlock]);

  return { executions, isLoading, error };
}

/**
 * Hook to fetch execution history for a single vault
 */
export function useVaultExecutionHistory(vaultAddress: string | undefined) {
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient({ chainId: 43113 });
  const { data: currentBlock } = useBlockNumber({ watch: true });

  useEffect(() => {
    async function fetchExecutions() {
      if (!publicClient || !vaultAddress || vaultAddress === "0x0000000000000000000000000000000000000000") {
        setExecutions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const events = await publicClient.getContractEvents({
          address: vaultAddress as `0x${string}`,
          abi: parseAbi(DCAVaultABI),
          eventName: "DCAExecuted",
          fromBlock: 0n,
          toBlock: "latest",
        });

        const fetchedExecutions: ExecutionRecord[] = [];
        for (const event of events) {
          if (event.args.amountSpent !== undefined && event.args.timestamp !== undefined) {
            fetchedExecutions.push({
              vaultAddress,
              timestamp: Number(event.args.timestamp),
              amountSpent: event.args.amountSpent,
              txHash: event.transactionHash,
              blockNumber: Number(event.blockNumber),
            });
          }
        }

        // Sort by timestamp (newest first)
        fetchedExecutions.sort((a, b) => b.timestamp - a.timestamp);
        setExecutions(fetchedExecutions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExecutions();
  }, [publicClient, vaultAddress, currentBlock]);

  return { executions, isLoading, error };
}

/**
 * Get total statistics from execution history
 */
export function useExecutionStats(executions: ExecutionRecord[]) {
  const totalExecutions = executions.length;
  
  const totalAmountSpent = executions.reduce(
    (sum, exec) => sum + Number(exec.amountSpent), 
    0
  );

  // Convert from USDC (6 decimals) to human-readable
  const totalUSDC = totalAmountSpent / 1e6;

  // Get unique vaults
  const uniqueVaults = new Set(executions.map(e => e.vaultAddress)).size;

  // Get first and last execution
  const firstExecution = executions.length > 0 ? executions[executions.length - 1] : null;
  const lastExecution = executions.length > 0 ? executions[0] : null;

  return {
    totalExecutions,
    totalUSDC,
    uniqueVaults,
    firstExecution,
    lastExecution,
  };
}

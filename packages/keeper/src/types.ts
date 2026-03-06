/**
 * Type definitions for DCA Keeper
 */

export interface VaultInfo {
  address: string;
  owner: string;
  canExecute: boolean;
  lastExecution: number;
  nextExecution: number;
  frequency: number;
  active: boolean;
  buyAmount: bigint;
  totalInvested: bigint;
  executionCount: number;
}

export interface ExecutionResult {
  success: boolean;
  vaultAddress: string;
  txHash?: string;
  gasUsed?: number;
  error?: string;
}

export interface KeeperStats {
  totalChecks: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalGasUsed: number;
  lastCheckTime: number;
  uptime: number;
}

export interface VaultStatus {
  address: string;
  owner: string;
  canExecute: boolean;
  lastExecution: number;
  nextExecution: number;
  frequency: number;
  active: boolean;
}

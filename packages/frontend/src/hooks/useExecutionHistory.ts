"use client";
import { useState } from "react";

export interface ExecutionRecord {
  id: string;
  executedAt: number;
  buyAmount: string;
  avaxReceived: string;
  txHash: string;
}

export function useExecutionHistory() {
  const [history] = useState<ExecutionRecord[]>([]);
  const [isLoading] = useState(false);
  return { history, isLoading };
}

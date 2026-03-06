"use client";

import { useAccount, usePublicClient } from "wagmi";
import { useState, useEffect } from "react";
import { useVault } from "./useVault";

export function useExecutionHistory() {
  const { isConnected } = useAccount();
  const { vaultAddress } = useVault();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // History will populate after first DCA execution
    setHistory([]);
  }, [vaultAddress]);

  return { history, isLoading };
}

"use client";
import { useState, useEffect } from "react";
import { useVault } from "./useVault";

export function useExecutionHistory() {
  const { vaultAddress } = useVault();
  const [history] = useState<any[]>([]);
  const [isLoading] = useState(false);
  return { history, isLoading };
}

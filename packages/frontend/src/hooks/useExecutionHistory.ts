"use client";
import { useState } from "react";

export function useExecutionHistory() {
  const [history] = useState<any[]>([]);
  const [isLoading] = useState(false);
  return { history, isLoading };
}

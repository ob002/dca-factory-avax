"use client";
import { useExecutionHistory } from "@/hooks/useExecutionHistory";
import type { ExecutionRecord } from "@/hooks/useExecutionHistory";

export function ExecutionHistory() {
  const { history, isLoading } = useExecutionHistory();

  if (isLoading) {
    return <div className="text-gray-500 text-sm">Loading...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-2xl mb-2">—</p>
        <p className="text-sm">No executions yet</p>
        <p className="text-xs text-gray-600 mt-1">Executions happen automatically via keeper</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {history.map((record: ExecutionRecord) => (
        <div key={record.id} className="flex justify-between items-center p-3 border border-gray-800 rounded">
          <div>
            <p className="text-sm text-gray-100">{record.buyAmount} USDC → {record.avaxReceived} AVAX</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(record.executedAt * 1000).toLocaleString()}</p>
          </div>
          <a href={`https://testnet.snowtrace.io/tx/${record.txHash}`} target="_blank" rel="noreferrer" className="text-red-500 text-xs">
            View →
          </a>
        </div>
      ))}
    </div>
  );
}

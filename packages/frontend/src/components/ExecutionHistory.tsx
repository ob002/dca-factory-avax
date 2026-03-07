"use client";
import type { CSSProperties } from "react";
import { useExecutionHistory } from "@/hooks/useExecutionHistory";
import type { ExecutionRecord } from "@/hooks/useExecutionHistory";

export function ExecutionHistory() {
  const { history, isLoading } = useExecutionHistory();

  if (isLoading) {
    return <div style={{ color: "#555", fontSize: "0.8rem" } as CSSProperties}>Loading...</div>;
  }

  if (history.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 0", color: "#444" } as CSSProperties}>
        <p style={{ fontSize: "2rem", marginBottom: "0.5rem" } as CSSProperties}>—</p>
        <p style={{ fontSize: "0.8rem" } as CSSProperties}>No executions yet</p>
        <p style={{ fontSize: "0.75rem", color: "#333", marginTop: "0.25rem" } as CSSProperties}>
          Executions happen automatically via keeper
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" } as CSSProperties}>
      {history.map((record: ExecutionRecord) => (
        <div key={record.id} style={{
          background: "#0A0A0A", border: "1px solid #1a1a1a",
          padding: "0.75rem 1rem", borderRadius: "2px",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        } as CSSProperties}>
          <div>
            <p style={{ color: "#F5F5F5", fontSize: "0.8rem" } as CSSProperties}>
              {record.buyAmount} USDC → {record.avaxReceived} AVAX
            </p>
            <p style={{ color: "#555", fontSize: "0.7rem", marginTop: "0.25rem" } as CSSProperties}>
              {new Date(record.executedAt * 1000).toLocaleString()}
            </p>
          </div>
          
            href={`https://testnet.snowtrace.io/tx/${record.txHash}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#E84142", fontSize: "0.75rem", textDecoration: "none" } as CSSProperties}
          >
            View →
          </a>
        </div>
      ))}
    </div>
  );
}

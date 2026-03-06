"use client";

import { formatDistanceToNow } from "date-fns";
import { ExecutionRecord } from "@/hooks/useExecutionHistory";

interface ExecutionHistoryProps {
  executions: ExecutionRecord[];
  isLoading?: boolean;
  limit?: number;
  showVaultAddress?: boolean;
}

/**
 * ExecutionHistory Component
 * Displays a table of past DCA executions
 */
export function ExecutionHistory({ 
  executions, 
  isLoading = false, 
  limit,
  showVaultAddress = false 
}: ExecutionHistoryProps) {
  const displayExecutions = limit ? executions.slice(0, limit) : executions;

  if (isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        padding: "3rem" 
      }}>
        <div style={{ 
          width: "24px", 
          height: "24px", 
          border: "2px solid #333", 
          borderTop: "2px solid #E84142", 
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
      </div>
    );
  }

  if (executions.length === 0) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "3rem", 
        color: "#444" 
      }}>
        <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>—</p>
        <p style={{ fontSize: "0.85rem" }}>No executions yet</p>
        <p style={{ fontSize: "0.75rem", color: "#333", marginTop: "0.25rem" }}>
          Executions will appear here after your first DCA
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ 
        width: "100%", 
        borderCollapse: "collapse", 
        fontSize: "0.8rem" 
      }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #222" }}>
            <th style={{ 
              textAlign: "left", 
              padding: "0.75rem", 
              color: "#555", 
              fontWeight: 500,
              textTransform: "uppercase",
              fontSize: "0.7rem",
              letterSpacing: "0.1em"
            }}>
              Time
            </th>
            {showVaultAddress && (
              <th style={{ 
                textAlign: "left", 
                padding: "0.75rem", 
                color: "#555", 
                fontWeight: 500,
                textTransform: "uppercase",
                fontSize: "0.7rem",
                letterSpacing: "0.1em"
              }}>
                Vault
              </th>
            )}
            <th style={{ 
              textAlign: "left", 
              padding: "0.75rem", 
              color: "#555", 
              fontWeight: 500,
              textTransform: "uppercase",
              fontSize: "0.7rem",
              letterSpacing: "0.1em"
            }}>
              Amount
            </th>
            <th style={{ 
              textAlign: "left", 
              padding: "0.75rem", 
              color: "#555", 
              fontWeight: 500,
              textTransform: "uppercase",
              fontSize: "0.7rem",
              letterSpacing: "0.1em"
            }}>
              TX Hash
            </th>
          </tr>
        </thead>
        <tbody>
          {displayExecutions.map((execution, index) => (
            <tr 
              key={`${execution.txHash}-${index}`}
              style={{ 
                borderBottom: "1px solid #1a1a1a",
                transition: "background 0.15s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0A0A0A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <td style={{ padding: "0.75rem", color: "#888", fontFamily: "monospace" }}>
                {formatDistanceToNow(execution.timestamp * 1000, { addSuffix: true })}
              </td>
              
              {showVaultAddress && (
                <td style={{ padding: "0.75rem", color: "#555", fontFamily: "monospace", fontSize: "0.75rem" }}>
                  {execution.vaultAddress.slice(0, 8)}...{execution.vaultAddress.slice(-6)}
                </td>
              )}
              
              <td style={{ padding: "0.75rem", color: "#F5F5F5", fontFamily: "monospace" }}>
                ${(Number(execution.amountSpent) / 1e6).toFixed(2)} USDC
              </td>
              
              <td style={{ padding: "0.75rem" }}>
                <a 
                  href={`https://testnet.snowtrace.io/tx/${execution.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ 
                    color: "#E84142", 
                    textDecoration: "none", 
                    fontFamily: "monospace",
                    fontSize: "0.75rem"
                  }}
                >
                  {execution.txHash.slice(0, 10)}...{execution.txHash.slice(-8)} ↗
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {limit && executions.length > limit && (
        <div style={{ 
          textAlign: "center", 
          padding: "1rem", 
          color: "#555", 
          fontSize: "0.8rem" 
        }}>
          + {executions.length - limit} more executions
        </div>
      )}
    </div>
  );
}

/**
 * ExecutionStats Component
 * Displays summary statistics for execution history
 */
export function ExecutionStats({ executions }: { executions: ExecutionRecord[] }) {
  const totalExecutions = executions.length;
  const totalUSDC = executions.reduce(
    (sum, exec) => sum + Number(exec.amountSpent), 
    0
  ) / 1e6;
  
  const uniqueVaults = new Set(executions.map(e => e.vaultAddress)).size;

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(3, 1fr)", 
      gap: "1rem",
      marginBottom: "1.5rem"
    }}>
      <div style={{ 
        background: "#0A0A0A", 
        border: "1px solid #1a1a1a", 
        padding: "1.25rem", 
        borderRadius: "4px" 
      }}>
        <p style={{ color: "#555", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Total Executions
        </p>
        <p style={{ color: "#E84142", fontSize: "1.8rem", fontWeight: 700, fontFamily: "monospace" }}>
          {totalExecutions}
        </p>
      </div>
      
      <div style={{ 
        background: "#0A0A0A", 
        border: "1px solid #1a1a1a", 
        padding: "1.25rem", 
        borderRadius: "4px" 
      }}>
        <p style={{ color: "#555", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Total Volume
        </p>
        <p style={{ color: "#F5F5F5", fontSize: "1.8rem", fontWeight: 700, fontFamily: "monospace" }}>
          ${totalUSDC.toFixed(2)}
        </p>
      </div>
      
      <div style={{ 
        background: "#0A0A0A", 
        border: "1px solid #1a1a1a", 
        padding: "1.25rem", 
        borderRadius: "4px" 
      }}>
        <p style={{ color: "#555", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Active Vaults
        </p>
        <p style={{ color: "#F5F5F5", fontSize: "1.8rem", fontWeight: 700, fontFamily: "monospace" }}>
          {uniqueVaults}
        </p>
      </div>
    </div>
  );
}
